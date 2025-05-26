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
 * NavigationTab component - Enhanced with map click coordinate selection
 */
const NavigationTab = ({
                           onFindPath,
                           busStops,
                           onInputFocus,
                           startCoordinates,
                           endCoordinates,
                           lines,
                           onMapClick, // New prop to handle map clicks
                           mapRef // Reference to the map instance
                       }) => {
    // Use enhanced NavigationViewModel
    const {
        path,
        route,
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
    } = useNavigationViewModel();

    // Map interaction states
    const [pickingStart, setPickingStart] = useState(false);
    const [pickingEnd, setPickingEnd] = useState(false);
    const [mapClickHandler, setMapClickHandler] = useState(null);

    // Loading states
    const [startLoading, setStartLoading] = useState(false);
    const [endLoading, setEndLoading] = useState(false);
    const [showStartSuggestions, setShowStartSuggestions] = useState(false);
    const [showEndSuggestions, setShowEndSuggestions] = useState(false);
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);
    const [showStrategyInfo, setShowStrategyInfo] = useState(false);
    const [showComparison, setShowComparison] = useState(false);

    // Refs for suggestion containers
    const startSuggestionsRef = useRef(null);
    const endSuggestionsRef = useRef(null);

    // Handle map click for location selection
    const handleMapClickForLocation = (coordinates) => {
        console.log('HandleMapClickForLocation received:', coordinates, typeof coordinates);

        // Ensure coordinates is an array
        if (!Array.isArray(coordinates) || coordinates.length < 2) {
            console.error('Invalid coordinates received:', coordinates);
            return;
        }

        const [lng, lat] = coordinates;
        const locationName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

        if (pickingStart) {
            // Set start location from map click
            handleStartSuggestionClick({
                name: locationName,
                coordinates: [lat, lng], // Note: handleStartSuggestionClick expects [lat, lng]
                address: 'Selected on map'
            });
            setPickingStart(false);
            console.log('Start location set from map:', { lat, lng, name: locationName });
        } else if (pickingEnd) {
            // Set end location from map click
            handleEndSuggestionClick({
                name: locationName,
                coordinates: [lat, lng], // Note: handleEndSuggestionClick expects [lat, lng]
                address: 'Selected on map'
            });
            setPickingEnd(false);
            console.log('End location set from map:', { lat, lng, name: locationName });
        }

        // Reset cursor and clear picking states
        resetMapCursor();
    };

    // Reset map cursor to default
    const resetMapCursor = () => {
        if (mapRef && mapRef.current) {
            mapRef.current.getCanvas().style.cursor = '';
        }
        document.body.style.cursor = 'default';
    };

    // Set map cursor to crosshair
    const setMapCursorToCrosshair = () => {
        if (mapRef && mapRef.current) {
            mapRef.current.getCanvas().style.cursor = 'crosshair';
        }
        document.body.style.cursor = 'crosshair';
    };

    // Handle picking locations on map
    const handlePickLocation = (type) => {
        console.log(`Starting to pick ${type} location`);

        if (type === 'start') {
            setPickingStart(true);
            setPickingEnd(false);
            onInputFocus('start'); // Notify parent about input focus
        } else {
            setPickingStart(false);
            setPickingEnd(true);
            onInputFocus('end'); // Notify parent about input focus
        }

        setMapCursorToCrosshair();
    };

    // Cancel picking location
    const cancelPickingLocation = () => {
        setPickingStart(false);
        setPickingEnd(false);
        resetMapCursor();
        onInputFocus(null); // Clear input focus
        console.log('Location picking cancelled');
    };

    // Setup map click handler
    useEffect(() => {
        if (pickingStart || pickingEnd) {
            // Create a new map click handler
            const clickHandler = (coordinates) => {
                handleMapClickForLocation(coordinates);
            };

            setMapClickHandler(() => clickHandler);

            // Set up the click handler with parent component
            if (onMapClick) {
                onMapClick(clickHandler);
            }

            setMapCursorToCrosshair();
        } else {
            // Clear the click handler
            setMapClickHandler(null);
            if (onMapClick) {
                onMapClick(null);
            }
            resetMapCursor();
        }

        // Cleanup function
        return () => {
            if (!pickingStart && !pickingEnd) {
                resetMapCursor();
            }
        };
    }, [pickingStart, pickingEnd]); // Remove onMapClick from dependencies to prevent infinite loop

    // Handle escape key to cancel location picking
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && (pickingStart || pickingEnd)) {
                cancelPickingLocation();
            }
        };

        if (pickingStart || pickingEnd) {
            document.addEventListener('keydown', handleKeyDown);
            return () => {
                document.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [pickingStart, pickingEnd]);

    // Update local state when props change
    useEffect(() => {
        if (startCoordinates && !pickingStart) {
            const coords = startCoordinates.split(', ').map(Number);
            if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                handleStartSuggestionClick({
                    name: `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`,
                    coordinates: coords,
                    address: 'From external input'
                });
            }
        }
    }, [startCoordinates, pickingStart]);

    useEffect(() => {
        if (endCoordinates && !pickingEnd) {
            const coords = endCoordinates.split(', ').map(Number);
            if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                handleEndSuggestionClick({
                    name: `${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`,
                    coordinates: coords,
                    address: 'From external input'
                });
            }
        }
    }, [endCoordinates, pickingEnd]);

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

    // Handle input changes
    const handleStartInputChange = (value) => {
        // Don't handle input changes when picking from map
        if (pickingStart) return;

        handleStartChange(value);
        if (value.trim()) {
            setShowStartSuggestions(true);
            setStartLoading(true);
        } else {
            setShowStartSuggestions(false);
            setStartLoading(false);
        }
    };

    const handleEndInputChange = (value) => {
        // Don't handle input changes when picking from map
        if (pickingEnd) return;

        handleEndChange(value);
        if (value.trim()) {
            setShowEndSuggestions(true);
            setEndLoading(true);
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

    // Find path using selected strategy
    const handleFindPath = async () => {
        if (!start || !end || !start.coordinates || !end.coordinates) {
            setError('Please select both start and end locations');
            return;
        }

        setIsLoadingRoute(true);
        try {
            const [startLat, startLng] = start.coordinates.map(Number);
            const [endLat, endLng] = end.coordinates.map(Number);

            console.log('Finding path with coordinates:', {
                start: { lat: startLat, lng: startLng },
                end: { lat: endLat, lng: endLng }
            });

            // Use strategy pattern to find path
            const strategyResult = await findPath(
                [startLng, startLat], // Note: findPath expects [lng, lat]
                [endLng, endLat],
                busStops,
                lines
            );

            if (strategyResult && strategyResult.length > 0) {
                // Transform to MapView format
                const mapViewPath = pathTransformerService.transformForMapView(strategyResult);

                console.log('Route found:', strategyResult);
                console.log('Transformed MapView Path:', mapViewPath);

                // Pass to parent component
                onFindPath(mapViewPath, null, routeMetadata);
            } else {
                setError('No route found between the selected locations');
            }

            setShowComparison(false);
            clearStrategyComparison();
        } catch (err) {
            console.error('Error finding path:', err);
            setError(err.message || 'Failed to find route');
        } finally {
            setIsLoadingRoute(false);
        }
    };

    // Compare all available strategies
    const handleCompareStrategies = async () => {
        if (!start || !end || !start.coordinates || !end.coordinates) {
            setError('Please select both start and end locations');
            return;
        }

        const [startLat, startLng] = start.coordinates.map(Number);
        const [endLat, endLng] = end.coordinates.map(Number);

        const results = await compareAllStrategies(
            [startLng, startLat],
            [endLng, endLat],
            busStops,
            lines
        );

        if (results.length > 0) {
            const bestStrategyPath = results[0].path;
            const mapViewPath = pathTransformerService.transformForMapView(bestStrategyPath);

            onFindPath(mapViewPath, null, results[0].metadata);
            setShowComparison(true);
        }
    };

    // Select a route from comparison results
    const handleSelectComparisonRoute = (index) => {
        selectRouteFromComparison(index);

        if (strategyComparison[index]) {
            const selectedStrategyPath = strategyComparison[index].path;
            const mapViewPath = pathTransformerService.transformForMapView(selectedStrategyPath);

            onFindPath(mapViewPath, null, strategyComparison[index].metadata);
        }
    };

    return (
        <div className="p-4">
            {/* Location picking notification */}
            {(pickingStart || pickingEnd) && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-blue-800">
                            📍 Click on the map to select {pickingStart ? 'starting point' : 'destination'}
                        </p>
                        <button
                            onClick={cancelPickingLocation}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                        Press Escape to cancel selection
                    </p>
                </div>
            )}

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
                            placeholder={pickingStart ? "Click on map to select..." : "Choose starting point..."}
                            value={start.name || ""}
                            onChange={(e) => handleStartInputChange(e.target.value)}
                            onFocus={() => {
                                if (!pickingStart) {
                                    onInputFocus("start");
                                    if (start.name && start.name.trim()) {
                                        setShowStartSuggestions(true);
                                    }
                                }
                            }}
                            disabled={pickingStart}
                            className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 placeholder:text-gray-400 ${
                                pickingStart ? 'bg-blue-50 border-blue-300' : ''
                            }`}
                        />
                        <button
                            onClick={() => pickingStart ? cancelPickingLocation() : handlePickLocation('start')}
                            aria-label={pickingStart ? "Cancel start location selection" : "Pick start location on map"}
                            className={`p-2 rounded-md transition-colors ${
                                pickingStart
                                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                                    : 'hover:bg-green-50 text-green-500'
                            }`}
                        >
                            <FiCrosshair className={pickingStart ? "text-white" : "text-green-500"} />
                        </button>

                        {/* Start location suggestions */}
                        {showStartSuggestions && !pickingStart && (
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
                            placeholder={pickingEnd ? "Click on map to select..." : "Choose destination..."}
                            value={end.name || ""}
                            onChange={(e) => handleEndInputChange(e.target.value)}
                            onFocus={() => {
                                if (!pickingEnd) {
                                    onInputFocus("end");
                                    if (end.name && end.name.trim()) {
                                        setShowEndSuggestions(true);
                                    }
                                }
                            }}
                            disabled={pickingEnd}
                            className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 placeholder:text-gray-400 ${
                                pickingEnd ? 'bg-blue-50 border-blue-300' : ''
                            }`}
                        />
                        <button
                            onClick={() => pickingEnd ? cancelPickingLocation() : handlePickLocation('end')}
                            aria-label={pickingEnd ? "Cancel end location selection" : "Pick end location on map"}
                            className={`p-2 rounded-md transition-colors ${
                                pickingEnd
                                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                                    : 'hover:bg-green-50 text-green-500'
                            }`}
                        >
                            <FiCrosshair className={pickingEnd ? "text-white" : "text-green-500"} />
                        </button>

                        {/* End location suggestions */}
                        {showEndSuggestions && !pickingEnd && (
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
                    disabled={pickingStart || pickingEnd}
                    aria-label="Swap start and end locations"
                    className="p-2 hover:bg-green-50 rounded-md transition-colors mt-auto mb-auto disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={pickingStart || pickingEnd}
                    className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={!start || !end || !start.coordinates || !end.coordinates || isLoadingRoute || pickingStart || pickingEnd}
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
                    disabled={!start || !end || !start.coordinates || !end.coordinates || isComparing || isLoadingRoute || pickingStart || pickingEnd}
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

            {/* Route Details */}
            {isLoadingRoute ? (
                <RouteDetailsSkeleton />
            ) : path && path.length > 0 ? (
                <div className="mt-4">
                    <RouteDetails
                        path={path}
                        route={route}
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
    onMapClick: PropTypes.func, // New prop for handling map clicks
    mapRef: PropTypes.object, // Reference to map instance
};

export default NavigationTab;