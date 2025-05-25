import { useState, useCallback, useEffect } from "react";
import geolocationService from "../../../services/GeolocationService";
import routeFinderContext from "../../../services/strategies/RouteFinderContext";
import Route from '@/components/Route/Route.jsx';
import RouteComponent from '@/components/Route/RouteComponent.jsx';
import pathTransformerService from "../../../services/PathTransformerService";

/**
 * NavigationViewModel - Enhanced to work with Composite pattern Route objects
 * Handles navigation state and manages Route composite objects from strategies
 */
const useNavigationViewModel = () => {
    const [path, setPath] = useState([]); // Legacy path array for MapView compatibility
    const [route, setRoute] = useState(null); // New Route composite object
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

            // If there's an existing route, inform user they can recalculate
            if (route && route instanceof Route) {
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
     * Finds path using the selected strategy and returns both Route object and legacy path
     * @param {Array} startCoords - Starting coordinates
     * @param {Array} endCoords - Ending coordinates
     * @param {Array} busStops - Available bus stops
     * @param {Array} busLines - Available bus lines
     * @returns {Promise<Array>} - Legacy path array for MapView compatibility
     */
    const findPath = async (startCoords, endCoords, busStops, busLines) => {
        try {
            setError(null);
            setRouteMetadata(null);
            setRoute(null);

            const result = await routeFinderContext.findPath(
                startCoords,
                endCoords,
                busStops,
                busLines
            );

            if (result && result.path instanceof Route) {
                // Store the Route composite object
                setRoute(result.path);
                setRouteMetadata(result.metadata);

                // Transform Route object to legacy path format for MapView
                const legacyPath = pathTransformerService.transformForMapView(result.path);
                setPath(legacyPath);
                setError(null);

                console.log('Route found:', {
                    route: result.path,
                    legacyPath: legacyPath,
                    metadata: result.metadata
                });

                return legacyPath;
            } else {
                handleError("No valid path found with the selected strategy.");
                return [];
            }
        } catch (err) {
            handleError(err.message || "An error occurred while finding the path.");
            return [];
        }
    };

    /**
     * Compares all available strategies and shows results
     * @param {Array} startCoords - Starting coordinates
     * @param {Array} endCoords - Ending coordinates
     * @param {Array} busStops - Available bus stops
     * @param {Array} busLines - Available bus lines
     * @returns {Promise<Array>} - Array of comparison results
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

            // Transform Route objects to include legacy path for each result
            const enhancedResults = results.map(result => ({
                ...result,
                legacyPath: pathTransformerService.transformForMapView(result.path)
            }));

            setStrategyComparison(enhancedResults);

            // Set the best result as the current route
            if (enhancedResults.length > 0) {
                const bestResult = enhancedResults[0];
                setRoute(bestResult.path);
                setPath(bestResult.legacyPath);
                setRouteMetadata(bestResult.metadata);

                console.log('Strategy comparison completed:', {
                    totalResults: enhancedResults.length,
                    bestStrategy: bestResult.strategyUsed?.name,
                    bestScore: bestResult.score
                });
            }

            return enhancedResults;
        } catch (err) {
            handleError(err.message || "An error occurred while comparing strategies.");
            return [];
        } finally {
            setIsComparing(false);
        }
    };

    /**
     * Selects a specific route from strategy comparison
     * @param {number} routeIndex - Index of route to select
     */
    const selectRouteFromComparison = (routeIndex) => {
        if (strategyComparison[routeIndex]) {
            const selectedResult = strategyComparison[routeIndex];
            setRoute(selectedResult.path);
            setPath(selectedResult.legacyPath || pathTransformerService.transformForMapView(selectedResult.path));
            setRouteMetadata(selectedResult.metadata);

            // Update the current strategy to match the selected route
            if (selectedResult.strategyUsed && selectedResult.strategyUsed.type) {
                handleStrategyChange(selectedResult.strategyUsed.type);
            }

            console.log('Route selected from comparison:', {
                index: routeIndex,
                strategy: selectedResult.strategyUsed?.name,
                score: selectedResult.score
            });
        }
    };

    /**
     * Gets strategy recommendations based on current context
     * @param {Object} context - Additional context for recommendations
     * @returns {Array} - Array of strategy recommendations
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

    /**
     * Gets the current Route composite object
     * @returns {Route|null} - Current Route object
     */
    const getCurrentRoute = () => {
        return route;
    };

    /**
     * Gets route statistics from the current Route object
     * @returns {Object|null} - Route statistics
     */
    const getRouteStatistics = () => {
        if (!route || !(route instanceof Route)) {
            return null;
        }

        return route.getSummary();
    };

    /**
     * Validates the current route
     * @param {Object} constraints - Validation constraints
     * @returns {boolean} - Whether route is valid
     */
    const validateCurrentRoute = (constraints = {}) => {
        if (!route || !(route instanceof Route)) {
            return false;
        }

        return route.isValid() &&
            route.getWalkingDistance() <= (constraints.maxWalkingDistance || 5) &&
            route.getTransferCount() <= (constraints.maxTransfers || 3) &&
            route.getDuration() <= (constraints.maxDuration || 180);
    };

    /**
     * Optimizes the current route using a different strategy
     * @param {string} optimizationStrategy - Strategy to use for optimization
     * @returns {Promise<Route|null>} - Optimized route
     */
    const optimizeCurrentRoute = async (optimizationStrategy, busStops = [], busLines = []) => {
        if (!route || start.coordinates.length === 0 || end.coordinates.length === 0) {
            return null;
        }

        try {
            const originalStrategy = selectedStrategy;
            handleStrategyChange(optimizationStrategy);

            // Ensure coordinates are in [lng, lat] format
            let startCoords, endCoords;

            if (Array.isArray(start.coordinates) && start.coordinates.length >= 2) {
                startCoords = RouteComponent.ensureLngLat(start.coordinates);
            } else {
                startCoords = [106.70098, 10.77584]; // Default Ho Chi Minh City center
            }

            if (Array.isArray(end.coordinates) && end.coordinates.length >= 2) {
                endCoords = RouteComponent.ensureLngLat(end.coordinates);
            } else {
                endCoords = [106.70598, 10.78084]; // Default nearby location
            }

            console.log('Optimization coordinates:', { startCoords, endCoords }); // Debug log

            const optimizedPath = await findPath(
                startCoords,
                endCoords,
                busStops,
                busLines
            );

            // Restore original strategy if optimization failed
            if (!optimizedPath || optimizedPath.length === 0) {
                handleStrategyChange(originalStrategy);
                return null;
            }

            console.log('Route optimized:', {
                originalStrategy,
                newStrategy: optimizationStrategy,
                originalScore: route.calculateOptimizationScore(),
                newScore: route.calculateOptimizationScore()
            });

            return route;
        } catch (error) {
            console.error('Error optimizing route:', error);
            return null;
        }
    };

    /**
     * Creates a Route object from legacy path data
     * @param {Array} legacyPath - Legacy path array
     * @param {Object} options - Creation options
     * @returns {Route} - New Route object
     */
    const createRouteFromPath = (legacyPath, options = {}) => {
        try {
            return pathTransformerService.transformToRoute(legacyPath, {
                name: options.name || 'Custom Route',
                strategy: selectedStrategy,
                metadata: options.metadata || {}
            });
        } catch (error) {
            console.error('Error creating route from path:', error);
            return new Route({
                name: 'Error Route',
                metadata: { error: error.message }
            });
        }
    };

    /**
     * Handles errors consistently
     * @param {string} message - Error message
     */
    const handleError = (message) => {
        console.error('NavigationViewModel Error:', message);
        setPath([]);
        setRoute(null);
        setRouteMetadata(null);
        setError(message);
    };

    /**
     * Swaps start and end locations
     */
    const handleSwap = () => {
        const temp = start;
        setStart(end);
        setEnd(temp);

        const tempSuggestions = startSuggestions;
        setStartSuggestions(endSuggestions);
        setEndSuggestions(tempSuggestions);

        console.log('Start and end locations swapped');
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

    // Log route changes for debugging
    useEffect(() => {
        if (route instanceof Route) {
            console.log('Route updated:', {
                name: route.name,
                distance: route.getDistance(),
                duration: route.getDuration(),
                transfers: route.getTransferCount(),
                segments: route.getComponents().length
            });
        }
    }, [route]);

    return {
        // Legacy path functionality (for MapView compatibility)
        path,
        setPath,

        // New Route composite functionality
        route,
        setRoute,

        // Common functionality
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

        // Strategy-related functionality
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

        // New Route composite functionality
        getCurrentRoute,
        getRouteStatistics,
        validateCurrentRoute,
        optimizeCurrentRoute,
        createRouteFromPath,

        // Enhanced utility functions
        getCurrentStrategy: () => routeFinderContext.getCurrentStrategy(),
        resetToDefaultStrategy: () => {
            routeFinderContext.resetToDefault();
            setSelectedStrategy(routeFinderContext.getCurrentStrategyType());
            console.log('Reset to default strategy');
        },
        clearStrategyPreference: () => {
            routeFinderContext.clearUserPreference();
            setSelectedStrategy(routeFinderContext.getCurrentStrategyType());
            console.log('Cleared strategy preferences');
        },

        // Route transformation utilities
        transformRouteToLegacy: (routeObj) => {
            try {
                return pathTransformerService.transformFromRoute(routeObj);
            } catch (error) {
                console.error('Error transforming route to legacy format:', error);
                return [];
            }
        },
        transformLegacyToRoute: (legacyPath, options) => {
            try {
                return pathTransformerService.transformToRoute(legacyPath, options);
            } catch (error) {
                console.error('Error transforming legacy path to route:', error);
                return new Route({ name: 'Error Route' });
            }
        },

        // Route analysis
        getRouteComplexity: () => {
            return route instanceof Route ? route.getComponents().length : 0;
        },
        getRouteConfidence: () => {
            return route instanceof Route ? (route.confidence || 0.8) : 0;
        },
        getRouteScore: () => {
            return route instanceof Route ? route.calculateOptimizationScore() : Infinity;
        },

        // Route operations
        cloneCurrentRoute: () => {
            return route instanceof Route ? route.clone() : null;
        },
        validateRoute: (routeObj, constraints) => {
            if (!(routeObj instanceof Route)) return false;
            return routeObj.isValid();
        },

        // Export/Import functionality for route sharing
        exportRoute: () => {
            try {
                return route instanceof Route ? route.toJSON() : null;
            } catch (error) {
                console.error('Error exporting route:', error);
                return null;
            }
        },
        importRoute: (routeData) => {
            try {
                const importedRoute = Route.fromJSON(routeData);
                setRoute(importedRoute);
                setPath(pathTransformerService.transformForMapView(importedRoute));
                setRouteMetadata(importedRoute.metadata);
                console.log('Route imported successfully');
                return true;
            } catch (error) {
                console.error('Error importing route:', error);
                setError('Failed to import route');
                return false;
            }
        },

        // Debug utilities
        getDebugInfo: () => ({
            hasRoute: route instanceof Route,
            routeName: route?.name,
            pathLength: path.length,
            selectedStrategy,
            errorState: error,
            comparisonResults: strategyComparison.length
        }),

        // Reset all state
        resetAll: () => {
            setPath([]);
            setRoute(null);
            setError(null);
            setStart({ name: "", coordinates: [] });
            setEnd({ name: "", coordinates: [] });
            setStartSuggestions([]);
            setEndSuggestions([]);
            setRouteMetadata(null);
            setStrategyComparison([]);
            routeFinderContext.resetToDefault();
            setSelectedStrategy(routeFinderContext.getCurrentStrategyType());
            console.log('All navigation state reset');
        }
    };
};

export default useNavigationViewModel;