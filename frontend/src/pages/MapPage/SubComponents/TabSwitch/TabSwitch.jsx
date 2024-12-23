import PropTypes from "prop-types";
import { useState } from "react";

const TabSwitch = ({ tabs, onTabSelect }) => {
    const [activeTab, setActiveTab] = useState(tabs[0].key);

    const handleTabClick = (key) => {
        setActiveTab(key);
        onTabSelect(key);
    };

    return (
        <div className="flex border-b border-gray-200 mb-4">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => handleTabClick(tab.key)}
                    className={`p-4 focus:outline-none ${activeTab === tab.key ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:text-blue-600"}`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

TabSwitch.propTypes = {
    tabs: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
    })).isRequired,
    onTabSelect: PropTypes.func.isRequired,
};

export default TabSwitch;