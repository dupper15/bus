import PropTypes from "prop-types";

const TabSwitch = ({ activeTab, onTabChange }) => {
    return (
        <div className="tab-switch">
            <button
                className={activeTab === "outbound" ? "active" : ""}
                onClick={() => onTabChange("outbound")}
            >
                Outbound Trip
            </button>
            <button
                className={activeTab === "return" ? "active" : ""}
                onClick={() => onTabChange("return")}
            >
                Return Trip
            </button>
        </div>
    );
};

export default TabSwitch;

TabSwitch.propTypes = {
    activeTab: PropTypes.string.isRequired,
    onTabChange: PropTypes.func.isRequired,
};