import { useEffect } from "react";
import PropTypes from "prop-types";
import { FaMapMarkerAlt, FaRegArrowAltCircleDown } from "react-icons/fa";
import { FiMapPin } from "react-icons/fi";
import useNavigationViewModel from "./NavigationViewModel";

const NavigationTab = ({ onFindPath, busStops, onInputFocus, startCoordinates, endCoordinates }) => {
    const {
        findPath,
        path,
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
    } = useNavigationViewModel();

    useEffect(() => {
        if (startCoordinates) {
            handleStartChange(startCoordinates).then();
        }
    }, [handleStartChange, startCoordinates]);

    useEffect(() => {
        if (endCoordinates) {
            handleEndChange(endCoordinates).then();
        }
    }, [endCoordinates, handleEndChange]);

    const handleFindPath = async () => {
        const [startLat, startLng] = start.coordinates.map(Number);
        const [endLat, endLng] = end.coordinates.map(Number);
        await findPath([startLng, startLat], [endLng, endLat], busStops);
        onFindPath(path, error); // Send path and error to MapPage
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Pathfinding</h3>
            <div className="flex flex-col gap-4">
                <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                    <input
                        type="text"
                        placeholder="Choose starting point"
                        value={start.name || ""}
                        onChange={(e) => handleStartChange(e.target.value)}
                        onFocus={() => onInputFocus("start")}
                        className="w-full pl-10 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    {startSuggestions.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded shadow-md max-h-40 overflow-y-auto">
                            {startSuggestions.map((suggestion) => (
                                <li
                                    key={suggestion.id}
                                    className="p-2 hover:bg-gray-200 cursor-pointer"
                                    onClick={() => handleStartSuggestionClick(suggestion)}
                                >
                                    {suggestion.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500" />
                    <input
                        type="text"
                        placeholder="Choose destination"
                        value={end.name || ""}
                        onChange={(e) => handleEndChange(e.target.value)}
                        onFocus={() => onInputFocus("end")}
                        className="w-full pl-10 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    {endSuggestions.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded shadow-md max-h-40 overflow-y-auto">
                            {endSuggestions.map((suggestion) => (
                                <li
                                    key={suggestion.id}
                                    className="p-2 hover:bg-gray-200 cursor-pointer"
                                    onClick={() => handleEndSuggestionClick(suggestion)}
                                >
                                    {suggestion.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <button
                    onClick={handleSwap}
                    className="p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 focus:outline-none"
                >
                    <FaRegArrowAltCircleDown />
                </button>
                <button
                    onClick={handleFindPath}
                    className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Find Path
                </button>
            </div>
        </div>
    );
};

NavigationTab.propTypes = {
    onFindPath: PropTypes.func.isRequired,
    busStops: PropTypes.array.isRequired,
    onInputFocus: PropTypes.func.isRequired,
    startCoordinates: PropTypes.string,
    endCoordinates: PropTypes.string,
};

export default NavigationTab;