import PropTypes from "prop-types";
import {linePropTypes} from "@/utils/PropTypes.js";
import useLineMapViewModel from "@/pages/Manager/LinePage/LineMap/LineMapViewModel.js";

export const LineMapView = ({currentLine, mode, error}) => {
    const {mapContainerRef} = useLineMapViewModel({
        currentLine,
        mode,
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

LineMapView.propTypes = {
    currentLine: linePropTypes.isRequired,
    mode: PropTypes.string.isRequired,
    error: PropTypes.string,
};