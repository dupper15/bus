import PropTypes from "prop-types";
import { stopPropTypes, linePropTypes } from "@/utils/PropTypes.js";
import useMapViewModel from "./MapViewModel";

const nestedCoordsPropType = PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number.isRequired).isRequired);

const pathPropType = PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.oneOf(["walking", "bus"]).isRequired,
    coords: nestedCoordsPropType.isRequired
}).isRequired);

/**
 * MapView component - Displays the interactive map with bus routes, stops, and navigation paths
 *
 * @param {Object} props - Component properties
 * @returns {JSX.Element} - Map view component
 */
const MapView = ({
                     mapData,
                     busLines,
                     stops,
                     selectedStopCoordinates,
                     mode,
                     path,
                     onMapClick
                 }) => {
    // Use refactored MapViewModel hook with Facade pattern
    const { mapContainerRef, error } = useMapViewModel({
        mapData,
        busLines,
        stops,
        selectedStopCoordinates,
        mode,
        path,
        onMapClick
    });

    // Display error message if there is an error
    if (error) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-100">
                <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md">
                    {error}
                </div>
            </div>
        );
    }

    // Render map container
    return (
        <div
            ref={mapContainerRef}
            className="w-full h-full relative"
            aria-label="Interactive map"
        />
    );
};

MapView.propTypes = {
    mapData: PropTypes.arrayOf(stopPropTypes),
    busLines: PropTypes.arrayOf(linePropTypes),
    stops: PropTypes.arrayOf(stopPropTypes),
    selectedStopCoordinates: PropTypes.arrayOf(PropTypes.number),
    mode: PropTypes.oneOf(["outbound", "inbound"]).isRequired,
    path: pathPropType.isRequired,
    error: PropTypes.string,
    onMapClick: PropTypes.func.isRequired,
};

export default MapView;