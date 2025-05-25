import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { FaMapMarkerAlt, FaInfoCircle } from "react-icons/fa";
import { FiMapPin, FiCrosshair } from "react-icons/fi";
import { FaArrowsUpDown } from "react-icons/fa6";
import { MdCompare } from "react-icons/md";
import useNavigationViewModel from "./NavigationViewModel";
import RouteDetails from "@/pages/MapPage/PathfindingTab/RouteDetail";
import pathTransformerService from "../../../services/PathTransformerService";

const NavigationTab = ({
                           onFindPath,
                           busStops,
                           onInputFocus,
                           startCoordinates,
                           endCoordinates,
                           lines,
                       }) => {
    const {
        path,
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

    useEffect(() => {
        if (startCoordinates) handleStartChange(startCoordinates);
    }, [startCoordinates]);

    useEffect(() => {
        if (endCoordinates) handleEndChange(endCoordinates);
    }, [endCoordinates]);

    const handleStartInputChange = (value) => {
        setStartClicked(false);
        handleStartChange(value);
    };

    const handleEndInputChange = (value) => {
        setEndClicked(false);
        handleEndChange(value);
    };

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

    useEffect(() => {
        if (!pickingStart && !pickingEnd) {
            document.body.style.cursor = 'default';
        }
    }, [pickingStart, pickingEnd]);

    const handleFindPath = async () => {
        if (!start || !end) return;
        const [startLat, startLng] = start.coordinates.map(Number);
        const [endLat, endLng] = end.coordinates.map(Number);

        const strategyPath = await findPath(
            [startLng, startLat],
            [endLng, endLat],
            busStops,
            lines
        );

        if (strategyPath) {
            // Transform the path for MapView compatibility
            const mapViewPath = pathTransformerService.transformForMapView(strategyPath);

            // Debug logging
            console.log('Strategy Path:', strategyPath);
            console.log('Transformed MapView Path:', mapViewPath);
            console.log('Transformation Stats:', pathTransformerService.getTransformationStats(strategyPath, mapViewPath));

            // Pass the transformed path to the parent component
            onFindPath(mapViewPath, error);
        }

        setShowComparison(false);
        clearStrategyComparison();
    };

    const handleCompareStrategies = async () => {
        if (!start || !end) return;
        const [startLat, startLng] = start.coordinates.map(Number);
        const [endLat, endLng] = end.coordinates.map(Number);

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

            onFindPath(mapViewPath, null);
            setShowComparison(true);
        }
    };

    const handleSelectComparisonRoute = (index) => {
        selectRouteFromComparison(index);
        if (strategyComparison[index]) {
            // Transform the selected route for MapView
            const selectedStrategyPath = strategyComparison[index].path;
            const mapViewPath = pathTransformerService.transformForMapView(selectedStrategyPath);

            onFindPath(mapViewPath, null);
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
                    <div className="relative flex gap-2">
                        <input
                            type="text"
                            placeholder="Choose starting point..."
                            value={start.name || ""}
                            onChange={(e) => handleStartInputChange(e.target.value)}
                            onFocus={() => onInputFocus("start")}
                            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 placeholder:text-gray-400"
                        />
                        <button
                            onClick={() => handlePickLocation('start')}
                            className={`p-2 rounded-md transition-colors ${pickingStart ? 'bg-green-100' : 'hover:bg-green-50'}`}
                        >
                            <FiCrosshair className="text-green-500" />
                        </button>
                        {!startClicked && startSuggestions.length > 0 && (
                            <ul className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                {startSuggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        onClick={() => {
                                            handleStartSuggestionClick(suggestion);
                                            setStartClicked(true);
                                        }}
                                        className="px-3 py-2 text-sm hover:bg-green-50 cursor-pointer"
                                    >
                                        {suggestion.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="relative flex gap-2">
                        <input
                            type="text"
                            placeholder="Choose destination..."
                            value={end.name || ""}
                            onChange={(e) => handleEndInputChange(e.target.value)}
                            onFocus={() => onInputFocus("end")}
                            className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 placeholder:text-gray-400"
                        />
                        <button
                            onClick={() => handlePickLocation('end')}
                            className={`p-2 rounded-md transition-colors ${pickingEnd ? 'bg-green-100' : 'hover:bg-green-50'}`}
                        >
                            <FiCrosshair className="text-green-500" />
                        </button>
                        {!endClicked && endSuggestions.length > 0 && (
                            <ul className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                {endSuggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        onClick={() => {
                                            handleEndSuggestionClick(suggestion);
                                            setEndClicked(true);
                                        }}
                                        className="px-3 py-2 text-sm hover:bg-green-50 cursor-pointer"
                                    >
                                        {suggestion.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleSwap}
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
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <FaInfoCircle className="text-gray-400 text-sm" />
                    </button>
                </div>

                <select
                    value={selectedStrategy}
                    onChange={(e) => handleStrategyChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                >
                    {getAvailableStrategies().map((strategy) => (
                        <option key={strategy.key} value={strategy.key}>
                            {strategy.icon} {strategy.name}
                        </option>
                    ))}
                </select>

                {showStrategyInfo && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-800">
                            {getStrategyExplanation(selectedStrategy)}
                        </p>
                    </div>
                )}
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={handleFindPath}
                    disabled={!start || !end}
                    className="flex-1 py-2 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    Find Route
                </button>

                <button
                    onClick={handleCompareStrategies}
                    disabled={!start || !end || isComparing}
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
            {showComparison && strategyComparison.length > 0 && (
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
                </div>
            )}

            {/* Route Metadata */}
            {routeMetadata && (
                <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                    <div className="text-xs text-gray-600 space-y-1">
                        <div className="font-medium">Route Info:</div>
                        <div>Strategy: {routeMetadata.strategy}</div>
                        <div>Transfers: {routeMetadata.transfers}</div>
                        <div>Walking Distance: {routeMetadata.totalWalking?.toFixed(1)}km</div>
                        <div>Total Distance: {routeMetadata.totalDistance?.toFixed(1)}km</div>
                        {routeMetadata.score && (
                            <div>Optimization Score: {routeMetadata.score.toFixed(1)}</div>
                        )}
                    </div>
                </div>
            )}

            {/* Route Details */}
            {path && path.length > 0 && (
                <div className="mt-4">
                    <RouteDetails path={path} />
                </div>
            )}
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