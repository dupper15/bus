import { useState, useCallback, useEffect } from "react";
import geolocationService from "../../../services/GeolocationService";
import routingService from "../../../services/RoutingService";

/**
 * NavigationViewModel - Refactored to use service layer with facade pattern
 * Handles navigation state and delegates location/routing operations to services
 */
const useNavigationViewModel = () => {
    const [path, setPath] = useState([]);
    const [error, setError] = useState(null);
    const [start, setStart] = useState({ name: "", coordinates: [] });
    const [end, setEnd] = useState({ name: "", coordinates: [] });
    const [startSuggestions, setStartSuggestions] = useState([]);
    const [endSuggestions, setEndSuggestions] = useState([]);

    // Debounced search function
    const debouncedFetchSuggestions = useCallback(
        geolocationService.debounceSearch(async (query, setSuggestions) => {
            if (!query) {
                setSuggestions([]);
                return;
            }

            const bbox = geolocationService.getHCMCBoundingBox();
            const suggestions = await geolocationService.searchLocations(query, bbox);
            setSuggestions(suggestions);
        }, 300),
        []
    );

    const handleChange = (value, setField, setSuggestions) => {
        setField((prev) => ({ ...prev, name: value }));
        debouncedFetchSuggestions(value, setSuggestions);
    };

    const handleSuggestionClick = (suggestion, setField, setSuggestions) => {
        setField(suggestion);
        setSuggestions([]);
    };

    const findPath = async (startCoords, endCoords, busStops, busLines) => {
        try {
            setError(null);

            // Find nearby stops using routing service
            const nearbyStartStops = routingService.findNearestStops(startCoords, busStops);
            const nearbyEndStops = routingService.findNearestStops(endCoords, busStops);

            if (nearbyStartStops.length === 0 || nearbyEndStops.length === 0) {
                handleError("No nearby bus stops found within 1km.");
                return;
            }

            // Build stop routes map
            const stopRoutesMap = buildStopRoutesMap(busLines);

            // Find best path
            const bestPath = findBestPath(
                nearbyStartStops,
                nearbyEndStops,
                stopRoutesMap,
                busLines,
                busStops
            );

            if (bestPath) {
                // Create route segments with directions from routing service
                const formattedPath = await routingService.createRouteSegments(
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
            handleError(err.message || "An error occurred while finding the path.");
        }
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

    const findBestPath = (startStops, endStops, stopRoutesMap, busLines, busStops) => {
        const queue = new Queue();
        const visited = new Map();

        // Initialize queue with start stops
        startStops.forEach(({ stop: startStop, distance: initialWalk }) => {
            queue.enqueue({
                currentStop: startStop,
                path: [startStop],
                lines: [],
                transfers: 0,
                totalWalking: initialWalk,
                totalDistance: initialWalk,
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
                const finalScore = routingService.calculateRouteScore({
                    transfers: current.transfers,
                    totalDistance: current.totalWalking + endStopMatch.distance,
                    totalDuration: 0 // Will be calculated later
                });

                if (finalScore < minScore) {
                    minScore = finalScore;
                    bestPath = {
                        ...current,
                        segments: [...current.segments],
                        finalWalkDistance: endStopMatch.distance
                    };
                }
                continue;
            }

            // Don't explore if we've exceeded limits
            if (current.transfers >= 3 || current.totalWalking >= 4) continue;

            const currentRoutes = stopRoutesMap.get(current.currentStop.id);
            if (!currentRoutes) continue;

            // Explore bus routes
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

                        // Get intermediate stops
                        const intermediateStops = stops.slice(stopIndex, i + 1);

                        queue.enqueue({
                            currentStop: nextStop,
                            path: [...current.path, nextStop],
                            lines: isNewLine ?
                                [...current.lines, line] :
                                current.lines,
                            transfers: newTransfers,
                            totalWalking: current.totalWalking,
                            totalDistance: current.totalDistance,
                            segments: [
                                ...current.segments,
                                {
                                    type: 'bus',
                                    line: line,
                                    from: current.currentStop,
                                    to: nextStop,
                                    intermediateStops: intermediateStops
                                }
                            ]
                        });
                    }
                });
            });

            // Explore walking transfers
            const nearbyStops = routingService.findNearestStops(
                [current.currentStop.pointX, current.currentStop.pointY],
                busStops
            );

            nearbyStops.forEach(({ stop: nearStop, distance }) => {
                if (distance > 1 || nearStop.id === current.currentStop.id) return;

                const totalWalking = current.totalWalking + distance;
                if (totalWalking > 4) return;

                const key = `${nearStop.id}-${current.transfers}`;
                if (visited.has(key)) return;

                queue.enqueue({
                    currentStop: nearStop,
                    path: [...current.path, nearStop],
                    lines: current.lines,
                    transfers: current.transfers,
                    totalWalking: totalWalking,
                    totalDistance: current.totalDistance + distance,
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

    const handleError = (message) => {
        console.error(message);
        setPath([]);
        setError(message);
    };

    const handleSwap = () => {
        const temp = start;
        setStart(end);
        setEnd(temp);

        const tempSuggestions = startSuggestions;
        setStartSuggestions(endSuggestions);
        setEndSuggestions(tempSuggestions);
    };

    // Clear error after timeout
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 5000);

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

// Queue implementation for pathfinding
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