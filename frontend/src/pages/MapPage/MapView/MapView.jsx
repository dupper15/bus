import PropTypes from "prop-types";
import { stopPropTypes, linePropTypes } from "@/utils/PropTypes.js";
import useMapViewModel from "./MapViewModel";

const nestedCoordsPropType = PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number.isRequired).isRequired);

const pathPropType = PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.oneOf(["walking", "bus"]).isRequired,
    coords: nestedCoordsPropType.isRequired
}).isRequired);

/**
 * MapView component - Enhanced with click handler support for coordinate selection
 */
const MapView = ({
                     mapData,
                     busLines,
                     stops,
                     selectedStopCoordinates,
                     mode,
                     path,
                     onMapClick,
                     clickHandler, // New prop for custom click handlers
                     mapRef // Ref to expose map instance
                 }) => {
    // Use enhanced MapViewModel hook
    const { mapContainerRef, error, mapInstance } = useMapViewModel({
        mapData,
        busLines,
        stops,
        selectedStopCoordinates,
        mode,
        path,
        onMapClick,
        clickHandler,
        mapRef
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
    clickHandler: PropTypes.func, // Custom click handler function
    mapRef: PropTypes.object, // Map instance reference
};

export default MapView;