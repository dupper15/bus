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

    const findNearestBusStop = (coords, busStops) => {
        let nearestStop = null;
        let minDistance = Infinity;
        const maxDistance = 10; // 1 km

        busStops.forEach((stop) => {
            const distance = Math.sqrt(Math.pow(stop.pointX - coords[1], 2) + Math.pow(stop.pointY - coords[0], 2));
            const distanceInKm = distance * 111; // 1 degree is approximately 111 km

            if (distanceInKm < minDistance && distanceInKm <= maxDistance) {
                minDistance = distanceInKm;
                nearestStop = stop;
            }
        });

        return nearestStop;
    };

    const findPath = async (startCoords, endCoords, busStops, busLines) => {
        try {
            const startStop = findNearestBusStop(startCoords, busStops);
            const endStop = findNearestBusStop(endCoords, busStops);
            console.log("Start stop", startStop);
            console.log("End stop", endStop);

            if (!startStop || !endStop) {
                handleError("No nearby stops found.");
                return;
            }

            const shortestPath = findShortestPath(startStop, endStop, busLines);

            if (shortestPath) {
                const formattedPath = formatPath(shortestPath, startCoords, endCoords, startStop, endStop);
                setPath(formattedPath);
                setError(null);
                return formattedPath;
            } else {
                handleError("No path found within 3 transfers.");
            }
        } catch (err) {
            handleError(err.message || "An error occurred.");
        }
    };

    const findShortestPath = (startStop, endStop, busLines) => {
        const queue = [{ stop: startStop, path: [startStop], lines: [], transfers: 0 }];
        const visited = new Map();
        let shortestPath = null;

        while (queue.length > 0) {
            const { stop, path, lines, transfers } = queue.shift();

            if (stop.id === endStop.id) {
                if (!shortestPath || transfers < shortestPath.transfers) {
                    shortestPath = { path, lines, transfers };
                }
                continue;
            }

            const visitedKey = `${stop.id}-${transfers}`;
            if (visited.has(visitedKey) && visited.get(visitedKey) <= transfers) {
                continue;
            }
            visited.set(visitedKey, transfers);

            console.log("Exploring stop", stop.name, "with", lines.length, "lines", "and", transfers, "transfers");

            exploreBusLines(busLines, stop, path, lines, transfers, queue, visited);
        }

        return shortestPath;
    };

    const exploreBusLines = (busLines, currentStop, currentPath, currentLines, currentTransfers, queue, visited) => {
        busLines.forEach((line) => {
            if (!line.arr_stop.some(s => s.id === currentStop.id)) return;

            const directions = [line.arr_stop, [...line.arr_stop].reverse()];
            directions.forEach((stops) => {
                const stopIndex = stops.findIndex((s) => s.id === currentStop.id);
                if (stopIndex === -1) return;

                for (let i = stopIndex + 1; i < stops.length; i++) {
                    const nextStop = stops[i];
                    const visitedKey = `${nextStop.id}-${currentTransfers}`;
                    if (!visited.has(visitedKey)) {
                        visited.set(visitedKey, currentTransfers);

                        const newLines = currentLines.includes(line) ? currentLines : [...currentLines, line];
                        const newTransfers = currentLines.length === newLines.length ? currentTransfers : currentTransfers + 1;
                        const updatedPath = [...currentPath, ...stops.slice(stopIndex + 1, i + 1)];

                        queue.push({
                            stop: nextStop, path: updatedPath, lines: newLines, transfers: newTransfers,
                        });
                    }
                }
            });
        });
    };

    const formatPath = (shortestPath, startCoords, endCoords, startStop, endStop) => {
        const walkingPathToStartStop = [startCoords, [startStop.pointY, startStop.pointX]];
        const walkingPathFromEndStop = [[endStop.pointY, endStop.pointX], endCoords];

        const compressedBusPaths = compressBusPaths(shortestPath.path);

        return [{ type: "walking", coords: walkingPathToStartStop }, ...compressedBusPaths, {
            type: "walking", coords: walkingPathFromEndStop
        }];
    };

    const compressBusPaths = (busRouteStops) => {
        const compressedPaths = [];
        let currentPath = { type: "bus", coords: [] };

        busRouteStops.forEach((stop, index) => {
            currentPath.coords.push([stop.pointY, stop.pointX]);

            if (index < busRouteStops.length - 1 && stop.lineId !== busRouteStops[index + 1].lineId) {
                compressedPaths.push(currentPath);
                currentPath = { type: "bus", coords: [] };
            }
        });

        if (currentPath.coords.length > 0) {
            compressedPaths.push(currentPath);
        }

        return compressedPaths;
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

export default useNavigationViewModel;