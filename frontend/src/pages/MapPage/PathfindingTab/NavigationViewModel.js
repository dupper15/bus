import { useState, useCallback, useEffect } from "react";
import geolocationService from "../../../services/GeolocationService";
import routeFinderContext from "../../../services/strategies/RouteFinderContext";

/**
 * NavigationViewModel - Refactored to use RouteFinderContext with Strategy pattern
 * Handles navigation state and delegates pathfinding to the strategy context
 */
const useNavigationViewModel = () => {
    const [path, setPath] = useState([]);
    const [error, setError] = useState(null);
    const [start, setStart] = useState({ name: "", coordinates: [] });
    const [end, setEnd] = useState({ name: "", coordinates: [] });
    const [startSuggestions, setStartSuggestions] = useState([]);
    const [endSuggestions, setEndSuggestions] = useState([]);
    const [selectedStrategy, setSelectedStrategy] = useState(routeFinderContext.getCurrentStrategyType());
    const [routeMetadata, setRouteMetadata] = useState(null);
    const [isComparing, setIsComparing] = useState(false);
    const [strategyComparison, setStrategyComparison] = useState([]);

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

    /**
     * Changes the pathfinding strategy
     * @param {string} strategyType - The strategy type to use
     */
    const handleStrategyChange = (strategyType) => {
        try {
            routeFinderContext.setStrategy(strategyType);
            setSelectedStrategy(strategyType);

            // If there's an existing path, recalculate with new strategy
            if (path.length > 0 && start.coordinates.length > 0 && end.coordinates.length > 0) {
                // Don't auto-recalculate to avoid confusion, but we could add this as an option
                console.log('Strategy changed. Click "Find Route" to recalculate with new strategy.');
            }
        } catch (error) {
            console.error('Error changing strategy:', error);
            setError('Failed to change pathfinding strategy');
        }
    };

    /**
     * Gets available pathfinding strategies for UI display
     * @returns {Array} - Array of available strategies
     */
    const getAvailableStrategies = () => {
        return routeFinderContext.getAvailableStrategies();
    };

    /**
     * Gets explanation for a specific strategy
     * @param {string} strategyType - Strategy type to explain
     * @returns {string} - Strategy explanation
     */
    const getStrategyExplanation = (strategyType) => {
        return routeFinderContext.getStrategyExplanation(strategyType);
    };

    /**
     * Finds path using the selected strategy
     */
    const findPath = async (startCoords, endCoords, busStops, busLines) => {
        try {
            setError(null);
            setRouteMetadata(null);

            const result = await routeFinderContext.findPath(
                startCoords,
                endCoords,
                busStops,
                busLines
            );

            if (result && result.path) {
                setPath(result.path);
                setRouteMetadata(result.metadata);
                setError(null);
                return result.path;
            } else {
                handleError("No valid path found with the selected strategy.");
            }
        } catch (err) {
            handleError(err.message || "An error occurred while finding the path.");
        }
    };

    /**
     * Compares all available strategies and shows results
     */
    const compareAllStrategies = async (startCoords, endCoords, busStops, busLines) => {
        try {
            setIsComparing(true);
            setError(null);

            const results = await routeFinderContext.compareStrategies(
                startCoords,
                endCoords,
                busStops,
                busLines
            );

            setStrategyComparison(results);

            // Set the best result as the current path
            if (results.length > 0) {
                setPath(results[0].path);
                setRouteMetadata(results[0].metadata);
            }

            return results;
        } catch (err) {
            handleError(err.message || "An error occurred while comparing strategies.");
            return [];
        } finally {
            setIsComparing(false);
        }
    };

    /**
     * Selects a specific route from strategy comparison
     */
    const selectRouteFromComparison = (routeIndex) => {
        if (strategyComparison[routeIndex]) {
            const selectedRoute = strategyComparison[routeIndex];
            setPath(selectedRoute.path);
            setRouteMetadata(selectedRoute.metadata);

            // Update the current strategy to match the selected route
            if (selectedRoute.strategyUsed) {
                handleStrategyChange(selectedRoute.strategyUsed.type);
            }
        }
    };

    /**
     * Gets strategy recommendations based on current context
     */
    const getStrategyRecommendations = (context = {}) => {
        return routeFinderContext.getStrategyRecommendations(context);
    };

    /**
     * Clears strategy comparison results
     */
    const clearStrategyComparison = () => {
        setStrategyComparison([]);
    };

    const handleError = (message) => {
        console.error(message);
        setPath([]);
        setRouteMetadata(null);
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

    // Update selected strategy when context changes
    useEffect(() => {
        const currentStrategyType = routeFinderContext.getCurrentStrategyType();
        if (currentStrategyType !== selectedStrategy) {
            setSelectedStrategy(currentStrategyType);
        }
    }, [selectedStrategy]);

    return {
        // Existing functionality
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
        setError,

        // New strategy-related functionality
        selectedStrategy,
        handleStrategyChange,
        getAvailableStrategies,
        getStrategyExplanation,
        routeMetadata,

        // Strategy comparison functionality
        isComparing,
        strategyComparison,
        compareAllStrategies,
        selectRouteFromComparison,
        clearStrategyComparison,
        getStrategyRecommendations,

        // Utility functions
        getCurrentStrategy: () => routeFinderContext.getCurrentStrategy(),
        resetToDefaultStrategy: () => {
            routeFinderContext.resetToDefault();
            setSelectedStrategy(routeFinderContext.getCurrentStrategyType());
        },
        clearStrategyPreference: () => {
            routeFinderContext.clearUserPreference();
            setSelectedStrategy(routeFinderContext.getCurrentStrategyType());
        }
    };
};

export default useNavigationViewModel;