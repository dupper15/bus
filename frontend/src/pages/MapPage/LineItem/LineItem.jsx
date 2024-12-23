import PropTypes from 'prop-types';
import {linePropTypes} from "@/utils/PropTypes.js";

const LineItem = ({ line, onSelect }) => {
    return (
        <div
            className="p-4 border rounded shadow-sm hover:shadow-md hover:bg-gray-100 cursor-pointer"
            onClick={() => onSelect(line.id)}
        >
            <h4 className="font-bold">{line.name}</h4>
            <p className="text-sm text-gray-600">{`${line.start_place.name} - ${line.end_place.name}`}</p>
            <p className="text-sm text-gray-500">{`Time: ${line.time}`}</p>
        </div>
    );
};

LineItem.propTypes = {
    line: linePropTypes.isRequired,
    onSelect: PropTypes.func.isRequired,
};

export default LineItem;