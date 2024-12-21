import PropTypes from 'prop-types';

const LineItem = ({ line, onSelect }) => {
    return (
        <div
            className="p-4 border rounded shadow-sm hover:shadow-md hover:bg-gray-100 cursor-pointer"
            onClick={() => onSelect(line.id)}
        >
            <h4 className="font-bold">{line.name}</h4>
            <p className="text-sm text-gray-600">{`${line.start} - ${line.end}`}</p>
            <p className="text-sm text-gray-500">{`Time: ${line.time}`}</p>
        </div>
    );
};

LineItem.propTypes = {
    line: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        start: PropTypes.string.isRequired,
        end: PropTypes.string.isRequired,
        time: PropTypes.string.isRequired,
    }).isRequired,
    onSelect: PropTypes.func.isRequired,
};

export default LineItem;