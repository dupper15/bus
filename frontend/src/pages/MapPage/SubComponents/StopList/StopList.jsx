import PropTypes from "prop-types";

const StopList = ({ stops, selectedStop, onSelectStop }) => {
    return (
        <ul className="list-none p-0 space-y-2">
            {stops.map((stop, index) => (
                <li key={index} className="group">
                    <label
                        className={`flex items-center p-3 rounded-lg cursor-pointer transition 
                            ${
                            selectedStop === stop
                                ? "bg-blue-100 text-blue-600 font-medium"
                                : "bg-gray-50 hover:bg-gray-100"
                        }`}
                    >
                        <input
                            type="radio"
                            name="stop"
                            value={stop}
                            checked={selectedStop === stop}
                            onChange={() => onSelectStop(stop)}
                            className="hidden"
                        />
                        <span className="flex-grow">{stop}</span>
                    </label>
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
