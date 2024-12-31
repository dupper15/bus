import PropTypes from "prop-types";
import { useState } from "react";

const TabSwitch = ({ tabs, onTabSelect }) => {
    const [activeTab, setActiveTab] = useState(tabs[0].key);

    const handleTabClick = (key) => {
        setActiveTab(key);
        onTabSelect(key);
    };

    return (
        <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => handleTabClick(tab.key)}
                    className={`flex-1 py-4 px-6 text-sm font-medium transition-colors
                        ${activeTab === tab.key
                        ? 'text-green-500 border-b-2 border-green-500'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
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