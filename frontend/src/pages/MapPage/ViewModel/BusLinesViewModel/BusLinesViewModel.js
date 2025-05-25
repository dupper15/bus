import { useState, useCallback, useEffect } from "react";
import LineService from "@/services/LineService";
import StopService from "@/services/StopService";
import routingService from "@/services/RoutingService";
import routeFinderContext from "@/services/strategies/RouteFinderContext";
import { transformLine, transformStop } from "@/utils/Transformer.js";

/**
 * BusLinesViewModel - Enhanced for Strategy pattern compatibility
 * Manages bus lines and stops state, with enhanced pathfinding capabilities
 */
const useBusLinesViewModel = () => {
    // State variables
    const [stops, setStops] = useState([]);
    const [lines, setLines] = useState([]);
    const [busLines, setBusLines] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLine, setSelectedLine] = useState(null);
    const [selectedStop, setSelectedStop] = useState(null);
    const [selectedStopCoordinates, setSelectedStopCoordinates] = useState(null);
    const [path, setPath] = useState([]);
    const [error, setError] = useState(null);
    const [focusedInput, setFocusedInput] = useState(null);
    const [startCoordinates, setStartCoordinates] = useState("");
    const [endCoordinates, setEndCoordinates] = useState("");
    const [viewMode, setViewMode] = useState("outbound");

    // New strategy-related state
    const [currentStrategy, setCurrentStrategy] = useState(routeFinderContext.getCurrentStrategyType());
    const [routeMetadata, setRouteMetadata] = useState(null);

    // Fetch lines
    const fetchLines = useCallback(async () => {
        try {
            const response = await LineService.getLines();
            const rawLines = response.data;
            const sortedLines = rawLines.map(transformLine).sort((a, b) => {
                // Extract numbers from line names and compare them numerically
                const numA = parseInt(a.name.match(/\d+/)?.[0] || 0);
                const numB = parseInt(b.name.match(/\d+/)?.[0] || 0);
                return numA - numB;
            });
            setLines(sortedLines);
        } catch (error) {
            console.error("Error fetching lines:", error);
            setError("Failed to fetch bus lines");
        }
    }, []);

    // Fetch stops
    const fetchStops = useCallback(async () => {
        try {
            const response = await StopService.getStops();
            const rawStops = response.data;
            setStops(rawStops.map(transformStop));
        } catch (error) {
            console.error("Failed to fetch stops:", error);
            setError("Failed to fetch bus stops");
        }
    }, []);

    // Fetch bus line route using routing service
    const fetchBusLine = async (line) => {
        try {
            const stopsSequence = viewMode === "outbound"
                ? [line.end_place, ...line.arr_stop.slice().reverse(), line.start_place]
                : [line.start_place, ...line.arr_stop, line.end_place];

            // Use routing service to get the bus route
            const route = await routingService.getBusRoute(stopsSequence);

            if (route) {
                setBusLines([{
                    ...line,
                    route: {
                        coordinates: route.coordinates
                    }
                }]);
            }
        } catch (error) {
            console.error("Error fetching bus line route:", error);
            setError("Failed to fetch bus route");
        }
    };

    // Handle search
    const handleSearch = (query) => setSearchQuery(query);

    // Handle line selection
    const handleLineSelect = (line) => {
        setSelectedLine(line);
        setBusLines([]); // Clear bus lines to indicate loading
        fetchBusLine(line);
        setError(null); // Clear any previous errors

        // Clear any existing path when selecting a new line
        setPath([]);
        setRouteMetadata(null);
    };

    // Handle back
    const handleBack = () => {
        setSelectedLine(null);
        setBusLines([]);
        setSelectedStop(null);
        setSelectedStopCoordinates(null);
        setPath([]);
        setRouteMetadata(null);
    };

    // Handle stop selection
    const handleSelectStop = (stop) => {
        setSelectedStop(stop);
        const selectedStopData = stops.find((s) => s.name === stop);
        if (selectedStopData) {
            setSelectedStopCoordinates([selectedStopData.pointX, selectedStopData.pointY]);
        }
    };

    // Enhanced path finding with strategy support
    const handleFindPath = (newPath, newError, metadata = null) => {
        if (newPath) {
            setPath(newPath);
            setRouteMetadata(metadata);
            setError(null);
        } else {
            setError(newError);
            setPath([]);
            setRouteMetadata(null);
        }
    };

    // Enhanced path finding using RouteFinderContext
    const findPathWithStrategy = async (startCoords, endCoords, strategyType = null) => {
        try {
            setError(null);

            // Use specific strategy if provided, otherwise use current
            if (strategyType && strategyType !== currentStrategy) {
                routeFinderContext.setStrategy(strategyType);
                setCurrentStrategy(strategyType);
            }

            const result = await routeFinderContext.findPath(
                startCoords,
                endCoords,
                stops,
                lines
            );

            if (result && result.path) {
                setPath(result.path);
                setRouteMetadata(result.metadata);
                setError(null);
                return result;
            } else {
                throw new Error("No valid path found with the selected strategy.");
            }
        } catch (error) {
            console.error("Error finding path:", error);
            setError(error.message || "An error occurred while finding the path.");
            setPath([]);
            setRouteMetadata(null);
            return null;
        }
    };

    // Compare all strategies for a route
    const compareStrategies = async (startCoords, endCoords) => {
        try {
            setError(null);

            const results = await routeFinderContext.compareStrategies(
                startCoords,
                endCoords,
                stops,
                lines
            );

            // Set the best result as current path
            if (results.length > 0) {
                setPath(results[0].path);
                setRouteMetadata(results[0].metadata);
            }

            return results;
        } catch (error) {
            console.error("Error comparing strategies:", error);
            setError(error.message || "An error occurred while comparing strategies.");
            return [];
        }
    };

    // Get available strategies
    const getAvailableStrategies = () => {
        return routeFinderContext.getAvailableStrategies();
    };

    // Change current strategy
    const changeStrategy = (strategyType) => {
        try {
            routeFinderContext.setStrategy(strategyType);
            setCurrentStrategy(strategyType);

            // If there's an existing path, we could optionally recalculate it
            console.log(`Strategy changed to: ${strategyType}`);
        } catch (error) {
            console.error("Error changing strategy:", error);
            setError("Failed to change pathfinding strategy");
        }
    };

    // Handle input focus
    const handleInputFocus = (inputName) => setFocusedInput(inputName);

    // Handle map click
    const handleMapClick = (coordinates) => {
        if (focusedInput === "start") {
            setStartCoordinates(coordinates.join(", "));
        } else if (focusedInput === "end") {
            setEndCoordinates(coordinates.join(", "));
        }
    };

    // Get route recommendations based on context
    const getRouteRecommendations = (context = {}) => {
        return routeFinderContext.getStrategyRecommendations(context);
    };

    // Clear path and related data
    const clearPath = () => {
        setPath([]);
        setRouteMetadata(null);
        setError(null);
    };

    // Fetch stops and lines on mount
    useEffect(() => {
        fetchStops();
        fetchLines();
    }, [fetchLines, fetchStops]);

    // Update bus lines when view mode changes
    useEffect(() => {
        if (selectedLine) {
            fetchBusLine(selectedLine);
        }
    }, [selectedLine, viewMode]);

    // Clear error after timeout
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Monitor current strategy changes
    useEffect(() => {
        const strategyType = routeFinderContext.getCurrentStrategyType();
        if (strategyType !== currentStrategy) {
            setCurrentStrategy(strategyType);
        }
    }, [currentStrategy]);

    // Filter lines based on search query
    const filteredLines = lines.filter((line) => {
        const searchLower = searchQuery.toLowerCase();
        const lineName = line.name.toLowerCase();

        // If searching for a number, match it exactly
        if (/^\d+$/.test(searchQuery)) {
            return lineName.includes(`line ${searchQuery}`) ||
                lineName.includes(`line${searchQuery}`);
        }

        return lineName.includes(searchLower);
    });

    return {
        // Existing functionality
        lines: filteredLines,
        fetchLines,
        stops,
        fetchStops,
        busLines,
        setBusLines,
        fetchBusLine,
        handleSearch,
        selectedLine,
        setSelectedLine,
        selectedStop,
        setSelectedStop,
        selectedStopCoordinates,
        handleLineSelect,
        handleBack,
        handleSelectStop,
        path,
        error,
        handleFindPath,
        handleInputFocus,
        handleMapClick,
        startCoordinates,
        endCoordinates,
        viewMode,
        setViewMode,
        setError,
        setPath,

        // Enhanced strategy-related functionality
        currentStrategy,
        routeMetadata,
        findPathWithStrategy,
        compareStrategies,
        getAvailableStrategies,
        changeStrategy,
        getRouteRecommendations,
        clearPath,

        // Strategy context access
        routeFinderContext: () => routeFinderContext,

        // Utility functions
        getRouteStats: () => {
            if (!path || path.length === 0) return null;
            return routingService.getRouteSummary({ segments: path });
        },

        validateCurrentRoute: (constraints) => {
            if (!path || path.length === 0) return false;
            return routingService.validateRoute({ segments: path }, constraints);
        }
    };
};

export default useBusLinesViewModel;