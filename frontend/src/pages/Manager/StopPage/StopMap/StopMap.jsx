import PropTypes from "prop-types";
import useStopMapViewModel from "@/pages/Manager/StopPage/StopMap/StopMapViewModel.js";

const styles = `
.map-click-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  position: absolute;
  pointer-events: none;
  transition: background-color 0.3s ease;
}

.map-click-indicator.station {
  background-color: rgba(76, 175, 80, 0.4);
  border: 2px solid #4CAF50;
}

.map-click-indicator.stop {
  background-color: rgba(33, 150, 243, 0.4);
  border: 2px solid #2196F3;
}
`;

export const StopMapView = ({selectedStopCoordinates, mode, onMapClick, isStation}) => {
    const {mapContainerRef} = useStopMapViewModel({
        selectedStopCoordinates,
        mode,
        onMapClick,
        styles,
        isStation
    });

    return (
        <div
            ref={mapContainerRef}
            style={{
                width: "100%",
                height: "100%",
                cursor: (mode === 'add' || mode === 'edit') ? 'crosshair' : 'grab'
            }}
        />
    );
};

StopMapView.propTypes = {
    selectedStopCoordinates: PropTypes.arrayOf(PropTypes.number),
    mode: PropTypes.string.isRequired,
    error: PropTypes.string,
    onMapClick: PropTypes.func.isRequired,
    isStation: PropTypes.bool
};