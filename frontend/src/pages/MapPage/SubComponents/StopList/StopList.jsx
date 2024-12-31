import PropTypes from "prop-types";

const StopList = ({ stops, selectedStop, onSelectStop }) => {
    return (
        <ul className="space-y-1 px-2">
            {stops.map((stop, index) => (
                <li key={index}>
                    <button
                        onClick={() => onSelectStop(stop)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors
                            ${selectedStop === stop
                            ? 'bg-green-50 text-green-600 font-medium'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                    >
                        {stop}
                    </button>
                </li>
            ))}
        </ul>
    );
};

StopList.propTypes = {
    stops: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedStop: PropTypes.string,
    onSelectStop: PropTypes.func.isRequired,
};

export default StopList;
