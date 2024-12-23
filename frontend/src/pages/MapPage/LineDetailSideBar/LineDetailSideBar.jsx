import PropTypes from "prop-types";
import { linePropTypes } from "@/utils/PropTypes.js";

const LineDetailSideBar = ({ line, onBack }) => {
    return (
        <aside className="w-1/4 bg-gray-50 p-4 border-r border-gray-200">
            <button
                className="mb-4 text-blue-500 hover:underline"
                onClick={onBack}
            >
                &larr; Back
            </button>
            <h2 className="text-xl font-bold mb-4">{line.name}</h2>
            <p><strong>Start Place:</strong> {line.start_place.name}</p>
            <p><strong>End Place:</strong> {line.end_place.name}</p>
            <p><strong>Time:</strong> {line.time} minutes</p>
            <h3 className="text-lg font-bold mt-4">Stops:</h3>
            <ul>
                {line.arr_stop.map((stop) => (
                    <li key={stop.id}>{stop.name}</li>
                ))}
            </ul>
        </aside>
    );
};

LineDetailSideBar.propTypes = {
    line: linePropTypes.isRequired,
    onBack: PropTypes.func.isRequired,
};

export default LineDetailSideBar;