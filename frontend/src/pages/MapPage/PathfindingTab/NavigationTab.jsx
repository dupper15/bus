import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { FaMapMarkerAlt, FaInfoCircle } from "react-icons/fa";
import { FiMapPin, FiCrosshair } from "react-icons/fi";
import { FaArrowsUpDown } from "react-icons/fa6";
import { MdCompare } from "react-icons/md";
import useNavigationViewModel from "./NavigationViewModel";
import RouteDetails from "@/pages/MapPage/PathfindingTab/RouteDetail";
import pathTransformerService from "@/services/PathTransformerService";
import {
    SearchSuggestionsListSkeleton,
    StrategyComparisonSkeleton,
    RouteDetailsSkeleton
} from "@/components/ui/loadingSkeletons.jsx";

/**
 * NavigationTab component - Handles route finding and pathfinding functionality
 * Enhanced with loading skeletons for better UX
 *
 * @param {Object} props - Component properties
 * @returns {JSX.Element} - Navigation tab component
 */
const NavigationTab = ({
                           onFindPath,
                           busStops,
                           onInputFocus,
                           startCoordinates,
                           endCoordinates,
                           lines,
                       }) => {
    // Use enhanced NavigationViewModel with Strategy and Composite patterns
    const {
        path,
        route, // New Route composite object
        findPath,
        error,
        start,
        end,
        startSuggestions,
        endSuggestions,
        handleStartChange,
        handleEndChange,
        handleEndSuggestionClick,
        handleStartSuggestionClick,
        handleSwap,
        setError,

        // Strategy-related functionality
        selectedStrategy,
        handleStrategyChange,
        getAvailableStrategies,
        getStrategyExplanation,
        routeMetadata,

        // Strategy comparison
        isComparing,
        strategyComparison,
        compareAllStrategies,
        selectRouteFromComparison,
        clearStrategyComparison,
    } = useNavigationViewModel();

    const [startClicked, setStartClicked] = useState(false);
    const [endClicked, setEndClicked] = useState(false);
    const [pickingStart, setPickingStart] = useState(false);
    const [pickingEnd, setPickingEnd] = useState(false);
    const [showStrategyInfo, setShowStrategyInfo] = useState(false);
    const [showComparison, setShowComparison] = useState(false);

    // Loading states for search suggestions
    const [startLoading, setStartLoading] = useState(false);
    const [endLoading, setEndLoading] = useState(false);

    // Show/hide states for suggestion boxes
    const [showStartSuggestions, setShowStartSuggestions] = useState(false);
    const [showEndSuggestions, setShowEndSuggestions] = useState(false);

    // Route finding loading state
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);

    // Refs for suggestion containers
    const startSuggestionsRef = useRef(null);
    const endSuggestionsRef = useRef(null);

    // Update local state when props change
    useEffect(() => {
        if (startCoordinates) handleStartChange(startCoordinates);
    }, [startCoordinates, handleStartChange]);

    useEffect(() => {
        if (endCoordinates) handleEndChange(endCoordinates);
    }, [endCoordinates, handleEndChange]);

    // Handle clicks outside suggestion boxes
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (startSuggestionsRef.current && !startSuggestionsRef.current.contains(event.target)) {
                setShowStartSuggestions(false);
            }
            if (endSuggestionsRef.current && !endSuggestionsRef.current.contains(event.target)) {
                setShowEndSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handle input changes with sustained search box visibility
    const handleStartInputChange = (value) => {
        handleStartChange(value);

        if (value.trim()) {
            setShowStartSuggestions(true);
            setStartLoading(true);
            // Loading will be set to false when suggestions arrive
        } else {
            setShowStartSuggestions(false);
            setStartLoading(false);
        }
    };

    const handleEndInputChange = (value) => {
        handleEndChange(value);

        if (value.trim()) {
            setShowEndSuggestions(true);
            setEndLoading(true);
            // Loading will be set to false when suggestions arrive
        } else {
            setShowEndSuggestions(false);
            setEndLoading(false);
        }
    };

    // Update loading states when suggestions change
    useEffect(() => {
        if (startSuggestions.length > 0 || start.name === '') {
            setStartLoading(false);
        }
    }, [startSuggestions, start.name]);

    useEffect(() => {
        if (endSuggestions.length > 0 || end.name === '') {
            setEndLoading(false);
        }
    }, [endSuggestions, end.name]);

    // Handle picking locations on map
    const handlePickLocation = (type) => {
        if (type === 'start') {
            setPickingStart(true);
            setPickingEnd(false);
        } else {
            setPickingStart(false);
            setPickingEnd(true);
        }
        document.body.style.cursor = 'crosshair';
    };

    // Reset cursor when not picking
    useEffect(() => {
        if (!pickingStart && !pickingEnd) {
            document.body.style.cursor = 'default';
        }
    }, [pickingStart, pickingEnd]);

    // Find path using selected strategy
    const handleFindPath = async () => {
        if (!start || !end) return;

        setIsLoadingRoute(true);
        try {
            const [startLat, startLng] = start.coordinates.map(Number);
            const [endLat, endLng] = end.coordinates.map(Number);

            // Use strategy pattern to find path
            const strategyResult = await findPath(
                [startLng, startLat],
                [endLng, endLat],
                busStops,
                lines
            );

            if (strategyResult) {
                // Transform Route object to MapView format using PathTransformerService
                const mapViewPath = pathTransformerService.transformForMapView(strategyResult);

                // Log for debugging
                console.log('Route found:', strategyResult);
                console.log('Transformed MapView Path:', mapViewPath);
                console.log('Transformation Stats:',
                    pathTransformerService.getTransformationStats(strategyResult, mapViewPath));

                // Pass the transformed path to the parent component
                onFindPath(mapViewPath, error, routeMetadata);
            }

            setShowComparison(false);
            clearStrategyComparison();
        } finally {
            setIsLoadingRoute(false);
        }
    };

    // Compare all available strategies
    const handleCompareStrategies = async () => {
        if (!start || !end) return;

        const [startLat, startLng] = start.coordinates.map(Number);
        const [endLat, endLng] = end.coordinates.map(Number);

        // Use Strategy pattern to compare all strategies
        const results = await compareAllStrategies(
            [startLng, startLat],
            [endLng, endLat],
            busStops,
            lines
        );

        if (results.length > 0) {
            // Transform the best result for MapView
            const bestStrategyPath = results[0].path;
            const mapViewPath = pathTransformerService.transformForMapView(bestStrategyPath);

            console.log('Best Strategy Result:', results[0]);
            console.log('Transformed for MapView:', mapViewPath);

            onFindPath(mapViewPath, null, results[0].metadata);
            setShowComparison(true);
        }
    };

    // Select a route from comparison results
    const handleSelectComparisonRoute = (index) => {
        selectRouteFromComparison(index);

        if (strategyComparison[index]) {
            // Transform the selected route for MapView
            const selectedStrategyPath = strategyComparison[index].path;
            const mapViewPath = pathTransformerService.transformForMapView(selectedStrategyPath);

            onFindPath(mapViewPath, null, strategyComparison[index].metadata);
        }
    };

    return (
        <div className="p-4">
            {/* Location Input Section */}
            <div className="flex items-start gap-3 mb-4">
                <div className="flex flex-col items-center pt-3">
                    <FiMapPin className="text-green-500 text-lg" />
                    <div className="h-8 border-l border-gray-300 my-1"></div>
                    <FaMapMarkerAlt className="text-green-500 text-lg" />
                </div>

                <div className="flex-1 flex flex-col gap-4">
                    {/* Start location input */}
                    <div className="relative flex gap-2" ref={startSuggestionsRef}>
                        <input
                            type="text"
                            placeholder="Choose starting point..."
                            value={start.name || ""}
                            onChange={(e) => handleStartInputChange(e.target.value)}
                            onFocus={() => {
                                onInputFocus("start");
                                if (start.name && start.name.trim()) {
                                    setShowStartSuggestions(true);
                                }
                            }}
                            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 placeholder:text-gray-400"
                        />
                        <button
                            onClick={() => handlePickLocation('start')}
                            aria-label="Pick start location on map"
                            className={`p-2 rounded-md transition-colors ${pickingStart ? 'bg-green-100' : 'hover:bg-green-50'}`}
                        >
                            <FiCrosshair className="text-green-500" />
                        </button>

                        {/* Start location suggestions - positioned below input */}
                        {showStartSuggestions && (
                            startLoading ? (
                                <SearchSuggestionsListSkeleton count={3} />
                            ) : (
                                <ul className="absolute z-10 w-full top-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                    {startSuggestions.length > 0 ? (
                                        startSuggestions.map((suggestion, index) => (
                                            <li
                                                key={index}
                                                onClick={() => {
                                                    handleStartSuggestionClick(suggestion);
                                                    setShowStartSuggestions(false);
                                                }}
                                                className="px-3 py-2 text-sm hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                            >
                                                <div className="font-medium">{suggestion.name}</div>
                                                {suggestion.address && (
                                                    <div className="text-xs text-gray-500 mt-1">{suggestion.address}</div>
                                                )}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="px-3 py-4 text-center text-sm text-gray-500">
                                            No locations found
                                        </li>
                                    )}
                                </ul>
                            )
                        )}
                    </div>

                    {/* End location input */}
                    <div className="relative flex gap-2" ref={endSuggestionsRef}>
                        <input
                            type="text"
                            placeholder="Choose destination..."
                            value={end.name || ""}
                            onChange={(e) => handleEndInputChange(e.target.value)}
                            onFocus={() => {
                                onInputFocus("end");
                                if (end.name && end.name.trim()) {
                                    setShowEndSuggestions(true);
                                }
                            }}
                            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 placeholder:text-gray-400"
                        />
                        <button
                            onClick={() => handlePickLocation('end')}
                            aria-label="Pick end location on map"
                            className={`p-2 rounded-md transition-colors ${pickingEnd ? 'bg-green-100' : 'hover:bg-green-50'}`}
                        >
                            <FiCrosshair className="text-green-500" />
                        </button>

                        {/* End location suggestions - positioned below input */}
                        {showEndSuggestions && (
                            endLoading ? (
                                <SearchSuggestionsListSkeleton count={3} />
                            ) : (
                                <ul className="absolute z-10 w-full top-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                    {endSuggestions.length > 0 ? (
                                        endSuggestions.map((suggestion, index) => (
                                            <li
                                                key={index}
                                                onClick={() => {
                                                    handleEndSuggestionClick(suggestion);
                                                    setShowEndSuggestions(false);
                                                }}
                                                className="px-3 py-2 text-sm hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                            >
                                                <div className="font-medium">{suggestion.name}</div>
                                                {suggestion.address && (
                                                    <div className="text-xs text-gray-500 mt-1">{suggestion.address}</div>
                                                )}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="px-3 py-4 text-center text-sm text-gray-500">
                                            No locations found
                                        </li>
                                    )}
                                </ul>
                            )
                        )}
                    </div>
                </div>

                <button
                    onClick={handleSwap}
                    aria-label="Swap start and end locations"
                    className="p-2 hover:bg-green-50 rounded-md transition-colors mt-auto mb-auto"
                >
                    <FaArrowsUpDown className="text-green-500" />
                </button>
            </div>

            {/* Strategy Selection Section */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                        Route Strategy
                    </label>
                    <button
                        onClick={() => setShowStrategyInfo(!showStrategyInfo)}
                        aria-label="Show strategy information"
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <FaInfoCircle className="text-gray-400 text-sm" />
                    </button>
                </div>

                <select
                    value={selectedStrategy}
                    onChange={(e) => handleStrategyChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    aria-label="Select route strategy"
                >
                    {getAvailableStrategies().map((strategy) => (
                        <option key={strategy.key} value={strategy.key}>
                            {strategy.icon} {strategy.name}
                        </option>
                    ))}
                </select>

                {/* Strategy information */}
                {showStrategyInfo && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-800">
                            {getStrategyExplanation(selectedStrategy)}
                        </p>
                    </div>
                )}
            </div>

            {/* Error display */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={handleFindPath}
                    disabled={!start || !end || isLoadingRoute}
                    className="flex-1 py-2 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoadingRoute ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Finding Route...
                        </>
                    ) : (
                        'Find Route'
                    )}
                </button>

                <button
                    onClick={handleCompareStrategies}
                    disabled={!start || !end || isComparing || isLoadingRoute}
                    className="px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    title="Compare all strategies"
                >
                    {isComparing ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <MdCompare />
                    )}
                </button>
            </div>

            {/* Strategy Comparison Results */}
            {showComparison && (
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-700">
                            Strategy Comparison
                        </h3>
                        <button
                            onClick={() => {
                                setShowComparison(false);
                                clearStrategyComparison();
                            }}
                            className="text-xs text-gray-500 hover:text-gray-700"
                        >
                            Hide
                        </button>
                    </div>

                    {isComparing ? (
                        <StrategyComparisonSkeleton count={3} />
                    ) : strategyComparison.length > 0 ? (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {strategyComparison.map((result, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleSelectComparisonRoute(index)}
                                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                                        index === 0 ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium">
                                            {result.strategyUsed.icon} {result.strategyUsed.name}
                                        </span>
                                        {index === 0 && (
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                Best
                                            </span>
                                        )}
                                    </div>

                                    {result.metadata && (
                                        <div className="text-xs text-gray-600 space-y-1">
                                            <div>Transfers: {result.metadata.transfers}</div>
                                            <div>Walking: {result.metadata.totalWalking?.toFixed(1)}km</div>
                                            {result.metadata.score && (
                                                <div>Score: {result.metadata.score.toFixed(1)}</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>
            )}

            {/* Route Details - Using enhanced RouteDetails component with Composite pattern */}
            {isLoadingRoute ? (
                <RouteDetailsSkeleton />
            ) : path && path.length > 0 ? (
                <div className="mt-4">
                    <RouteDetails
                        path={path}
                        route={route} // Pass Route composite object if available
                    />
                </div>
            ) : null}
        </div>
    );
};

NavigationTab.propTypes = {
    onFindPath: PropTypes.func.isRequired,
    busStops: PropTypes.array.isRequired,
    lines: PropTypes.array.isRequired,
    onInputFocus: PropTypes.func.isRequired,
    startCoordinates: PropTypes.string,
    endCoordinates: PropTypes.string,
};

export default NavigationTab;