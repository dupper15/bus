import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { FaMapMarkerAlt, FaRegArrowAltCircleDown } from "react-icons/fa";
import { FiMapPin } from "react-icons/fi";
import useNavigationViewModel from "./NavigationViewModel";
import {FaArrowsUpDown} from "react-icons/fa6";

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
        if (startCoordinates) {
            handleStartChange(startCoordinates);
        }
    }, [startCoordinates]);

    useEffect(() => {
        if (endCoordinates) {
            handleEndChange(endCoordinates);
        }
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
            const timer = setTimeout(() => {
                setError(null);
            }, 3000);
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
        <div className="p-4 bg-white border border-gray-300 rounded-lg">
            <div className="flex items-start gap-4 flex-row">
                {/* Icon Column */}
                <div className="flex flex-col items-center pt-4">
                    <FiMapPin className="text-green-500 mb-4"/>
                    <div className="h-6 border-l-2 border-gray-300"></div>
                    <FaMapMarkerAlt className="text-red-500 mt-4"/>
                </div>

                {/* Input Fields */}
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Choose starting point, or click on the map..."
                            value={start.name || ""}
                            onChange={(e) => handleStartInputChange(e.target.value)}
                            onFocus={() => onInputFocus("start")}
                            className="w-full mb-4 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                        />
                        {!startClicked && startSuggestions.length > 0 && (
                            <ul
                                className="absolute z-10 bg-white border border-gray-300 rounded shadow-md max-h-40 overflow-y-auto"
                                style={{width: 'calc(100% - 2px)', marginTop: '4px'}}
                            >
                                {startSuggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        className="p-2 hover:bg-gray-200 cursor-pointer"
                                        onClick={() => {
                                            handleStartSuggestionClick(suggestion);
                                            setStartClicked(true);
                                        }}
                                    >
                                        {suggestion.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Choose destination..."
                            value={end.name || ""}
                            onChange={(e) => handleEndInputChange(e.target.value)}
                            onFocus={() => onInputFocus("end")}
                            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                        />
                        {!endClicked && endSuggestions.length > 0 && (
                            <ul
                                className="absolute z-10 bg-white border border-gray-300 rounded shadow-md max-h-40 overflow-y-auto"
                                style={{width: 'calc(100% - 2px)', marginTop: '4px'}}
                            >
                                {endSuggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        className="p-2 hover:bg-gray-200 cursor-pointer"
                                        onClick={() => {
                                            handleEndSuggestionClick(suggestion);
                                            setEndClicked(true);
                                        }}
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
                    className="p-3 bg-gray-200 rounded-full hover:bg-gray-300 focus:outline-none transition self-center"
                >
                    <FaArrowsUpDown className="text-gray-700" />
                </button>
            </div>
            {error && (
                <p className="text-center text-red-500 bg-red-100 p-3 rounded-lg mt-4">
                    {error}
                </p>
            )}
            <button
                onClick={handleFindPath}
                className="w-full mt-4 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition"
            >
                Find Path
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
