import { useState, useCallback, useEffect } from "react";
import GeoapifyService from "@/services/GeoapifyService";

const useNavigationViewModel = () => {
    const [path, setPath] = useState([]);
    const [error, setError] = useState(null);
    const [start, setStart] = useState({ name: "", coordinates: [] });
    const [end, setEnd] = useState({ name: "", coordinates: [] });
    const [startSuggestions, setStartSuggestions] = useState([]);
    const [endSuggestions, setEndSuggestions] = useState([]);

    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func(...args);
            }, delay);
        };
    };

    const fetchSuggestions = async (query, setSuggestions) => {
        if (!query) return;
        const bbox = [106.491, 10.348, 107.020, 11.160]; // Ho Chi Minh City bounding box
        const suggestions = await GeoapifyService.fetchSuggestions(query, bbox);
        setSuggestions(suggestions);
    };

    const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 300), []);

    const handleChange = (value, setField, setSuggestions) => {
        setField((prev) => ({ ...prev, name: value }));
        debouncedFetchSuggestions(value, setSuggestions);
    };

    const handleSuggestionClick = (suggestion, setField, setSuggestions) => {
        setField(suggestion);
        setSuggestions([]);
    };

    const findNearestBusStops = (coords, busStops, maxDistance = 1) => {
        const nearbyStops = [];

        busStops.forEach((stop) => {
            const distance = Math.sqrt(
                Math.pow(stop.pointX - coords[1], 2) +
                Math.pow(stop.pointY - coords[0], 2)
            ) * 111; // Convert to km

            if (distance <= maxDistance) {
                nearbyStops.push({ stop, distance });
            }
        });

        return nearbyStops.sort((a, b) => a.distance - b.distance);
    };

    const buildStopRoutesMap = (busLines) => {
        const stopRoutes = new Map();

        busLines.forEach((line) => {
            line.arr_stop.forEach((stop) => {
                if (!stopRoutes.has(stop.id)) {
                    stopRoutes.set(stop.id, new Set());
                }
                stopRoutes.get(stop.id).add(line);
            });
        });

        return stopRoutes;
    };

    const findPath = async (startCoords, endCoords, busStops, busLines) => {
        try {
            const nearbyStartStops = findNearestBusStops(startCoords, busStops);
            const nearbyEndStops = findNearestBusStops(endCoords, busStops);

            if (nearbyStartStops.length === 0 || nearbyEndStops.length === 0) {
                handleError("No nearby bus stops found within 1km.");
                return;
            }

            const stopRoutesMap = buildStopRoutesMap(busLines);
            const bestPath = findBestPath(
                nearbyStartStops,
                nearbyEndStops,
                stopRoutesMap,
                busLines,
                busStops
            );
            if (bestPath) {
                const formattedPath = formatFullPath(
                    bestPath,
                    startCoords,
                    endCoords
                );
                setPath(formattedPath);
                setError(null);
                return formattedPath;
            } else {
                handleError("No valid path found.");
            }
        } catch (err) {
            handleError(err.message || "An error occurred.");
        }
    };

    const findBestPath = (startStops, endStops, stopRoutesMap, busLines, busStops) => {
        const queue = new Queue();
        const visited = new Map();

        // Try each possible start stop
        startStops.forEach(({ stop: startStop, distance: initialWalk }) => {
            queue.enqueue({
                currentStop: startStop,
                path: [startStop],
                lines: [],
                transfers: 0,
                totalWalking: initialWalk,
                segments: [{
                    type: 'walking',
                    distance: initialWalk,
                    from: 'start',
                    to: startStop
                }]
            });
        });

        let bestPath = null;
        let minScore = Infinity;

        while (!queue.isEmpty()) {
            const current = queue.dequeue();

            // Check if we've reached any end stop
            const endStopMatch = endStops.find(
                ({ stop }) => stop.id === current.currentStop.id
            );

            if (endStopMatch) {
                const finalScore = calculatePathScore(
                    current.transfers,
                    current.totalWalking
                );
                if (finalScore < minScore) {
                    minScore = finalScore;
                    bestPath = {
                        ...current,
                        segments: [...current.segments]
                    };
                }
                continue;
            }

            // Don't explore if we've exceeded limits
            if (current.transfers >= 3 || current.totalWalking >= 4) continue;

            const currentRoutes = stopRoutesMap.get(current.currentStop.id);
            if (!currentRoutes) continue;

            // Explore each possible route from current stop
            currentRoutes.forEach(line => {
                const lineStops = line.arr_stop;
                const currentStopIndex = lineStops.findIndex(
                    s => s.id === current.currentStop.id
                );

                if (currentStopIndex === -1) return;

                // Try both directions
                [lineStops, [...lineStops].reverse()].forEach(stops => {
                    const stopIndex = stops.findIndex(
                        s => s.id === current.currentStop.id
                    );

                    // Explore next stops in this direction
                    for (let i = stopIndex + 1; i < stops.length; i++) {
                        const nextStop = stops[i];
                        const key = `${nextStop.id}-${current.transfers}`;

                        if (visited.has(key)) continue;
                        visited.set(key, true);

                        const isNewLine = !current.lines.includes(line);
                        const newTransfers = isNewLine ?
                            current.transfers + 1 :
                            current.transfers;

                        // Get all intermediate stops between current and next stop
                        const intermediateStops = stops.slice(stopIndex, i + 1);

                        queue.enqueue({
                            currentStop: nextStop,
                            path: [...current.path, nextStop],
                            lines: isNewLine ?
                                [...current.lines, line] :
                                current.lines,
                            transfers: newTransfers,
                            totalWalking: current.totalWalking,
                            segments: [
                                ...current.segments,
                                {
                                    type: 'bus',
                                    line: line,
                                    from: current.currentStop,
                                    to: nextStop,
                                    intermediateStops: intermediateStops // Add intermediate stops
                                }
                            ]
                        });
                    }
                });
            });

            // Explore walking transfers to nearby stops
            const nearbyStops = findNearestBusStops(
                [current.currentStop.pointY, current.currentStop.pointX],
                busStops
            );

            nearbyStops.forEach(({ stop: nearStop, distance }) => {
                if (distance > 1) return; // Skip if walking distance > 1km
                if (nearStop.id === current.currentStop.id) return; // Skip same stop

                const totalWalking = current.totalWalking + distance;
                if (totalWalking > 4) return; // Skip if total walking > 4km

                const key = `${nearStop.id}-${current.transfers}`;
                if (visited.has(key)) return;

                queue.enqueue({
                    currentStop: nearStop,
                    path: [...current.path, nearStop],
                    lines: current.lines,
                    transfers: current.transfers,
                    totalWalking: totalWalking,
                    segments: [
                        ...current.segments,
                        {
                            type: 'walking',
                            distance: distance,
                            from: current.currentStop,
                            to: nearStop
                        }
                    ]
                });
            });
        }

        return bestPath;
    };

    const calculatePathScore = (transfers, totalWalking) => {
        // Weighted scoring - lower is better
        // Prioritize fewer transfers over walking distance
        return transfers * 2 + totalWalking;
    };

    const formatFullPath = (pathData, startCoords, endCoords) => {
        const formattedSegments = [];

        // Add initial walking segment
        if (pathData.segments[0].type === 'walking') {
            formattedSegments.push({
                type: 'walking',
                distance: pathData.segments[0].distance,
                coords: [
                    startCoords,
                    [pathData.segments[0].to.pointY, pathData.segments[0].to.pointX]
                ],
                from: { name: 'Current Location' },  // Added for RouteDetails
                to: pathData.segments[0].to         // Added complete stop object for RouteDetails
            });
        }

        // Format middle segments
        for (let i = 1; i < pathData.segments.length; i++) {
            const segment = pathData.segments[i];

            if (segment.type === 'walking') {
                formattedSegments.push({
                    type: 'walking',
                    distance: segment.distance,
                    coords: [
                        [segment.from.pointY, segment.from.pointX],
                        [segment.to.pointY, segment.to.pointX]
                    ],
                    from: segment.from,  // Added complete stop object for RouteDetails
                    to: segment.to      // Added complete stop object for RouteDetails
                });
            } else { // bus segment
                // Calculate the actual distance for the bus segment
                const busStops = segment.intermediateStops;
                let busDistance = 0;
                for (let j = 0; j < busStops.length - 1; j++) {
                    const currentStop = busStops[j];
                    const nextStop = busStops[j + 1];
                    busDistance += Math.sqrt(
                        Math.pow(nextStop.pointX - currentStop.pointX, 2) +
                        Math.pow(nextStop.pointY - currentStop.pointY, 2)
                    ) * 111; // Convert to km
                }

                formattedSegments.push({
                    type: 'bus',
                    line: segment.line,
                    distance: busDistance,  // Added calculated distance
                    endStop: segment.to,
                    to: segment.intermediateStops,
                    coords: segment.intermediateStops.map(stop => [stop.pointY, stop.pointX]),
                    from: segment.from,     // Added complete stop object for RouteDetails
                    routeNumber: segment.line.routeNumber  // Added route number for RouteDetails
                });
            }
        }

        // Add final walking segment
        const lastStop = pathData.segments[pathData.segments.length - 1].to;
        formattedSegments.push({
            type: 'walking',
            distance: Math.sqrt(
                Math.pow(endCoords[0] - lastStop.pointY, 2) +
                Math.pow(endCoords[1] - lastStop.pointX, 2)
            ) * 111,  // Calculate actual distance for final walking segment
            coords: [
                [lastStop.pointY, lastStop.pointX],
                endCoords
            ],
            from: lastStop,           // Added complete stop object for RouteDetails
            to: { name: 'Destination' }  // Added for RouteDetails
        });

        return formattedSegments;
    };
    const handleError = (message) => {
        console.error(message);
        setPath([]);
        setError(message);
    };

    const handleSwap = () => {
        const temp = start;
        setStart(end);
        setEnd(temp);
    };

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 5000); // Clear error after 5 seconds

            return () => clearTimeout(timer);
        }
    }, [error]);

    return {
        path,
        setPath,
        error,
        start,
        end,
        startSuggestions,
        endSuggestions,
        findPath,
        handleStartChange: (value) => handleChange(value, setStart, setStartSuggestions),
        handleEndChange: (value) => handleChange(value, setEnd, setEndSuggestions),
        handleStartSuggestionClick: (suggestion) => handleSuggestionClick(suggestion, setStart, setStartSuggestions),
        handleEndSuggestionClick: (suggestion) => handleSuggestionClick(suggestion, setEnd, setEndSuggestions),
        handleSwap,
        setError
    };
};

class Queue {
    constructor() {
        this.items = [];
    }

    enqueue(item) {
        this.items.push(item);
    }

    dequeue() {
        return this.items.shift();
    }

    isEmpty() {
        return this.items.length === 0;
    }
}

export default useNavigationViewModel;