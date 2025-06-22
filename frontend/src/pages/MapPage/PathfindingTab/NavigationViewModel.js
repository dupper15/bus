import { useState, useCallback, useEffect } from "react";
import geolocationService from "../../../services/GeolocationService";
import routeFinderContext from "../../../services/strategies/RouteFinderContext";
import Route from '@/components/Route/Route.jsx';
import RouteComponent from '@/components/Route/RouteComponent.jsx';
import pathTransformerService from "../../../services/PathTransformerService";

const useNavigationViewModel = () => {
    const [path, setPath] = useState([]);
    const [route, setRoute] = useState(null);
    const [error, setError] = useState(null);
    const [start, setStart] = useState({ name: "", coordinates: [] });
    const [end, setEnd] = useState({ name: "", coordinates: [] });
    const [startSuggestions, setStartSuggestions] = useState([]);
    const [endSuggestions, setEndSuggestions] = useState([]);
    const [selectedStrategy, setSelectedStrategy] = useState(routeFinderContext.getCurrentStrategyType());
    const [routeMetadata, setRouteMetadata] = useState(null);
    const [isComparing, setIsComparing] = useState(false);
    const [strategyComparison, setStrategyComparison] = useState([]);

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

    const handleStrategyChange = (strategyType) => {
        try {
            routeFinderContext.setStrategy(strategyType);
            setSelectedStrategy(strategyType);

            if (route && route instanceof Route) {
                console.log('Strategy changed. Click "Find Route" to recalculate with new strategy.');
            }
        } catch (error) {
            console.error('Error changing strategy:', error);
            setError('Failed to change pathfinding strategy');
        }
    };

    const getAvailableStrategies = () => {
        return routeFinderContext.getAvailableStrategies();
    };

    const getStrategyExplanation = (strategyType) => {
        return routeFinderContext.getStrategyExplanation(strategyType);
    };

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
                setRoute(result.path);
                setRouteMetadata(result.metadata);

                const legacyPath = pathTransformerService.transformForMapView(result.path);
                setPath(legacyPath);
                setError(null);

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

            const enhancedResults = results.map(result => ({
                ...result,
                legacyPath: pathTransformerService.transformForMapView(result.path)
            }));

            setStrategyComparison(enhancedResults);

            if (enhancedResults.length > 0) {
                const bestResult = enhancedResults[0];
                setRoute(bestResult.path);
                setPath(bestResult.legacyPath);
                setRouteMetadata(bestResult.metadata);
            }

            return enhancedResults;
        } catch (err) {
            handleError(err.message || "An error occurred while comparing strategies.");
            return [];
        } finally {
            setIsComparing(false);
        }
    };

    const selectRouteFromComparison = (routeIndex) => {
        if (strategyComparison[routeIndex]) {
            const selectedResult = strategyComparison[routeIndex];
            setRoute(selectedResult.path);
            setPath(selectedResult.legacyPath || pathTransformerService.transformForMapView(selectedResult.path));
            setRouteMetadata(selectedResult.metadata);

            if (selectedResult.strategyUsed && selectedResult.strategyUsed.type) {
                handleStrategyChange(selectedResult.strategyUsed.type);
            }
        }
    };

    const getStrategyRecommendations = (context = {}) => {
        return routeFinderContext.getStrategyRecommendations(context);
    };

    const clearStrategyComparison = () => {
        setStrategyComparison([]);
    };

    const getCurrentRoute = () => {
        return route;
    };

    const getRouteStatistics = () => {
        if (!route || !(route instanceof Route)) {
            return null;
        }

        return route.getSummary();
    };

    const validateCurrentRoute = (constraints = {}) => {
        if (!route || !(route instanceof Route)) {
            return false;
        }

        return route.isValid() &&
            route.getWalkingDistance() <= (constraints.maxWalkingDistance || 5) &&
            route.getTransferCount() <= (constraints.maxTransfers || 3) &&
            route.getDuration() <= (constraints.maxDuration || 180);
    };

    const optimizeCurrentRoute = async (optimizationStrategy, busStops = [], busLines = []) => {
        if (!route || start.coordinates.length === 0 || end.coordinates.length === 0) {
            return null;
        }

        try {
            const originalStrategy = selectedStrategy;
            handleStrategyChange(optimizationStrategy);

            let startCoords, endCoords;

            if (Array.isArray(start.coordinates) && start.coordinates.length >= 2) {
                startCoords = RouteComponent.ensureLngLat(start.coordinates);
            } else {
                startCoords = [106.70098, 10.77584];
            }

            if (Array.isArray(end.coordinates) && end.coordinates.length >= 2) {
                endCoords = RouteComponent.ensureLngLat(end.coordinates);
            } else {
                endCoords = [106.70598, 10.78084];
            }

            const optimizedPath = await findPath(
                startCoords,
                endCoords,
                busStops,
                busLines
            );

            if (!optimizedPath || optimizedPath.length === 0) {
                handleStrategyChange(originalStrategy);
                return null;
            }

            return route;
        } catch (error) {
            console.error('Error optimizing route:', error);
            return null;
        }
    };

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

    const handleError = (message) => {
        console.error('NavigationViewModel Error:', message);
        setPath([]);
        setRoute(null);
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

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        const currentStrategyType = routeFinderContext.getCurrentStrategyType();
        if (currentStrategyType !== selectedStrategy) {
            setSelectedStrategy(currentStrategyType);
        }
    }, [selectedStrategy]);

    return {
        path,
        setPath,

        route,
        setRoute,

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

        selectedStrategy,
        handleStrategyChange,
        getAvailableStrategies,
        getStrategyExplanation,
        routeMetadata,

        isComparing,
        strategyComparison,
        compareAllStrategies,
        selectRouteFromComparison,
        clearStrategyComparison,
        getStrategyRecommendations,

        getCurrentRoute,
        getRouteStatistics,
        validateCurrentRoute,
        optimizeCurrentRoute,
        createRouteFromPath,

        getCurrentStrategy: () => routeFinderContext.getCurrentStrategy(),
        resetToDefaultStrategy: () => {
            routeFinderContext.resetToDefault();
            setSelectedStrategy(routeFinderContext.getCurrentStrategyType());
        },
        clearStrategyPreference: () => {
            routeFinderContext.clearUserPreference();
            setSelectedStrategy(routeFinderContext.getCurrentStrategyType());
        },

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

        getRouteComplexity: () => {
            return route instanceof Route ? route.getComponents().length : 0;
        },
        getRouteConfidence: () => {
            return route instanceof Route ? (route.confidence || 0.8) : 0;
        },
        getRouteScore: () => {
            return route instanceof Route ? route.calculateOptimizationScore() : Infinity;
        },

        cloneCurrentRoute: () => {
            return route instanceof Route ? route.clone() : null;
        },
        validateRoute: (routeObj, constraints) => {
            if (!(routeObj instanceof Route)) return false;
            return routeObj.isValid();
        },

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

        getDebugInfo: () => ({
            hasRoute: route instanceof Route,
            routeName: route?.name,
            pathLength: path.length,
            selectedStrategy,
            errorState: error,
            comparisonResults: strategyComparison.length
        }),

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
        }
    };
};

export default useNavigationViewModel;