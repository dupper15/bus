import {useState, useCallback, useEffect} from "react";
import GeoapifyService from "@/services/GeoapifyService";

const useNavigationViewModel = () => {
    const [path, setPath] = useState([]);
    const [error, setError] = useState(null);
    const [start, setStart] = useState({name: "", coordinates: []});
    const [end, setEnd] = useState({name: "", coordinates: []});
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
        setField((prev) => ({...prev, name: value}));
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

            // Convert distance from degrees to kilometers (approximation)
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

            if (!startStop || !endStop) {
                console.error("No nearby stops found.");
                setPath([]);
                setError("No nearby stops found.");
                return;
            }

            // BFS setup to find the bus route
            const queue = [{ stop: startStop, path: [startStop], lines: [], transfers: 0 }];
            const visited = new Set();
            let shortestPath = null;

            while (queue.length > 0) {
                const { stop, path, lines, transfers } = queue.shift();

                // Check if we've reached the destination
                if (stop.id === endStop.id) {
                    if (!shortestPath || path.length < shortestPath.length) {
                        shortestPath = { path, lines, transfers };
                    }
                    continue;
                }

                // Mark as visited
                const visitedKey = `${stop.id}-${transfers}`;
                if (visited.has(visitedKey)) continue;
                visited.add(visitedKey);

                // Explore neighbors
                busLines.forEach((line) => {
                    const stopIndex = line.arr_stop.findIndex((s) => s.id === stop.id);
                    if (stopIndex === -1) return; // Current stop not on this line

                    // Get all subsequent stops in the line
                    const subsequentStops = line.arr_stop.slice(stopIndex + 1);

                    subsequentStops.forEach((nextStop, i) => {
                        const newLines = lines.includes(line) ? lines : [...lines, line];
                        const newTransfers = newLines.length - lines.length;

                        if (newTransfers > 3) return; // Skip paths with excessive transfers

                        queue.push({
                            stop: nextStop,
                            path: [...path, ...subsequentStops.slice(0, i + 1)],
                            lines: newLines,
                            transfers: transfers + newTransfers,
                        });
                    });
                });
            }

            if (shortestPath) {
                const busRouteStops = shortestPath.path;

                // Walking paths
                const walkingPathToStartStop = [startCoords, [startStop.pointY, startStop.pointX]];
                const walkingPathFromEndStop = [[endStop.pointY, endStop.pointX], endCoords];

                // Compress bus paths
                const compressedBusPaths = compressBusPaths(busRouteStops);

                // Format path data
                const formattedPath = [
                    { type: "walking", coords: walkingPathToStartStop },
                    ...compressedBusPaths,
                    { type: "walking", coords: walkingPathFromEndStop },
                ];
                console.log("formattedPath", formattedPath);
                setPath(formattedPath);
                setError(null);
                return formattedPath;
            } else {
                setPath([]);
                setError("No path found within 3 transfers.");
            }
        } catch (err) {
            setPath([]);
            setError(err.message || "An error occurred.");
        }
    };

    const compressBusPaths = (busRouteStops) => {
        const compressedPaths = [];
        let currentPath = { type: "bus", coords: [] };

        busRouteStops.forEach((stop, index) => {
            currentPath.coords.push([stop.pointY, stop.pointX]);

            // Start a new path for the next segment
            if (
                index < busRouteStops.length - 1 &&
                stop.lineId !== busRouteStops[index + 1].lineId
            ) {
                compressedPaths.push(currentPath);
                currentPath = { type: "bus", coords: [] };
            }
        });

        if (currentPath.coords.length > 0) {
            compressedPaths.push(currentPath);
        }

        return compressedPaths;
    };


    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 5000); // Clear error after 5 seconds

            return () => clearTimeout(timer);
        }
    }, [error]);


    const handleSwap = () => {
        const temp = start;
        setStart(end);
        setEnd(temp);
    };

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