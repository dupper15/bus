import PropTypes from "prop-types";

const StopList = ({ stops, selectedStop, onSelectStop }) => {
    return (
        <ul className="stop-list">
            {stops.map((stop, index) => (
                <li key={index}>
                    <label>
                        <input
                            type="radio"
                            name="stop"
                            value={stop}
                            checked={selectedStop === stop}
                            onChange={() => onSelectStop(stop)}
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
}