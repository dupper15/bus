import PropTypes from "prop-types";
import { stopPropTypes, linePropTypes } from "@/utils/PropTypes.js";
import useMapViewModel from "@/pages/MapPage/MapView/MapViewModel.js";


const MapView = ({ mapData, busLines, stops, selectedStopCoordinates, mode, path, error, onMapClick }) => {
    const { mapContainerRef } = useMapViewModel({ mapData, busLines, stops, selectedStopCoordinates, mode, path, onMapClick });

    return (
        <>
            <div
                ref={mapContainerRef}
                style={{
                    width: "100%",
                    height: "100%",
                }}
            />
            {error && (
                <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-center py-2">
                    {error}
                </div>
            )}
        </>
    );
};

MapView.propTypes = {
    mapData: PropTypes.arrayOf(stopPropTypes),
    busLines: PropTypes.arrayOf(linePropTypes),
    stops: PropTypes.arrayOf(stopPropTypes),
    selectedStopCoordinates: PropTypes.arrayOf(PropTypes.number),
    mode: PropTypes.oneOf(["outbound", "inbound"]).isRequired,
    path: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
    error: PropTypes.string,
    onMapClick: PropTypes.func.isRequired,
};

export default MapView;