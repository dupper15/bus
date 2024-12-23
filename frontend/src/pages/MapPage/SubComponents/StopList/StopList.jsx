import PropTypes from "prop-types";

const StopList = ({ stops, selectedStop, onSelectStop }) => {
    return (
        <ul className="list-none p-0">
            {stops.map((stop, index) => (
                <li key={index} className="mb-2">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            name="stop"
                            value={stop}
                            checked={selectedStop === stop}
                            onChange={() => onSelectStop(stop)}
                            className="mr-2"
                        />
                        {stop}
                    </label>
                </li>
            ))}
        </ul>
    );
};

export default StopList;

StopList.propTypes = {
    stops: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedStop: PropTypes.string,
    onSelectStop: PropTypes.func.isRequired,
};