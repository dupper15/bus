import PropTypes from "prop-types";
import {stopPropTypes, linePropTypes} from "@/utils/PropTypes.js";
import useMapViewModel from "./MapViewModel";

const nestedCoordsPropType = PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number.isRequired).isRequired);

const pathPropType = PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.oneOf(["walking", "bus"]).isRequired, coords: nestedCoordsPropType.isRequired
}).isRequired);

const MapView = ({mapData, busLines, stops, selectedStopCoordinates, mode, path, error, onMapClick}) => {
    const {mapContainerRef} = useMapViewModel({
        mapData, busLines, stops, selectedStopCoordinates, mode, path, onMapClick
    });

    return (<>
        <div
            ref={mapContainerRef}
            style={{
                width: "100%", height: "100%",
            }}
        />
    </>);
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