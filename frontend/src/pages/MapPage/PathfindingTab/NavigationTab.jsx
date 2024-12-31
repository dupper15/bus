import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FiMapPin } from "react-icons/fi";
import { FaArrowsUpDown } from "react-icons/fa6";
import useNavigationViewModel from "./NavigationViewModel";

const NavigationTab = ({
                           onFindPath,
                           busStops,
                           onInputFocus,
                           startCoordinates,
                           endCoordinates,
                           lines,
                       }) => {
    const {
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
    } = useNavigationViewModel();

    const [startClicked, setStartClicked] = useState(false);
    const [endClicked, setEndClicked] = useState(false);

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

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const handleFindPath = async () => {
        if (!start || !end) return;
        const [startLat, startLng] = start.coordinates.map(Number);
        const [endLat, endLng] = end.coordinates.map(Number);
        const path = await findPath(
            [startLng, startLat],
            [endLng, endLat],
            busStops,
            lines
        );
        onFindPath(path, error);
    };

    return (
        <div className="p-4">
            <div className="flex items-start gap-3">
                {/* Icons Column */}
                <div className="flex flex-col items-center pt-3">
                    <FiMapPin className="text-green-500 text-lg"/>
                    <div className="h-8 border-l border-gray-300 my-1"></div>
                    <FaMapMarkerAlt className="text-green-500 text-lg"/>
                </div>

                {/* Input Fields Column */}
                <div className="flex-1 flex flex-col gap-4">
                    {/* Start Input */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Choose starting point..."
                            value={start.name || ""}
                            onChange={(e) => handleStartInputChange(e.target.value)}
                            onFocus={() => onInputFocus("start")}
                            className="w-full px-3 py-2 text-sm border rounded-md
                                     focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500
                                     placeholder:text-gray-400"
                        />
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

                    {/* End Input */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Choose destination..."
                            value={end.name || ""}
                            onChange={(e) => handleEndInputChange(e.target.value)}
                            onFocus={() => onInputFocus("end")}
                            className="w-full px-3 py-2 text-sm border rounded-md
                                     focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500
                                     placeholder:text-gray-400"
                        />
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

                {/* Swap Button */}
                <button
                    onClick={handleSwap}
                    className="p-2 hover:bg-green-50 rounded-md transition-colors mt-auto mb-auto"
                >
                    <FaArrowsUpDown className="text-green-500" />
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Find Path Button */}
            <button
                onClick={handleFindPath}
                className="w-full mt-4 py-2 bg-green-500 text-white text-sm font-medium rounded-md
                         hover:bg-green-600 transition-colors focus:outline-none focus:ring-2
                         focus:ring-offset-2 focus:ring-green-500"
            >
                Find Route
            </button>
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