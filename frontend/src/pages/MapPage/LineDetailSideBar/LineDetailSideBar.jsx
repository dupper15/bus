import PropTypes from "prop-types";
import { useState } from "react";
import { linePropTypes } from "@/utils/PropTypes.js";
import StopList from "@/pages/MapPage/SubComponents/StopList/StopList.jsx";
import TabSwitch from "@/pages/MapPage/SubComponents/TabSwitch/TabSwitch.jsx";

const LineDetailSideBar = ({ line, onBack, selectedStop, onSelectStop, onTabSelect }) => {
    const [activeTab, setActiveTab] = useState("details");

    const tabs = [
        { key: "details", label: "Details" },
        { key: "outbound", label: "Outbound" },
        { key: "inbound", label: "Inbound" },
    ];

    const handleTabSelect = (key) => {
        setActiveTab(key);
        if (key === "outbound" || key === "inbound") {
            onTabSelect(key);
        }
    };

    return (
        <aside className="w-1/4 bg-gradient-to-b from-gray-50 to-white shadow-xl p-6 border-r border-gray-300 h-full flex flex-col">
            <button
                className="mb-6 text-sm text-blue-600 hover:text-blue-800 transition-colors self-start"
                onClick={onBack}
            >
                &larr; Back
            </button>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">{line.name}</h2>
            <TabSwitch tabs={tabs} onTabSelect={handleTabSelect} />
            <div className="flex-1 overflow-y-auto mt-4">
                {activeTab === "details" && (
                    <div className="space-y-3 text-gray-700">
                        <p><strong>Start Place:</strong> {line.start_place.name}</p>
                        <p><strong>End Place:</strong> {line.end_place.name}</p>
                        <p><strong>Time:</strong> {line.time} minutes</p>
                    </div>
                )}
                {activeTab === "outbound" && (
                    <div>
                        <h3 className="text-xl font-medium text-gray-800 mt-4 mb-3">Outbound Stops:</h3>
                        <StopList
                            stops={line.arr_stop.map(stop => stop.name)}
                            selectedStop={selectedStop}
                            onSelectStop={onSelectStop}
                        />
                    </div>
                )}
                {activeTab === "inbound" && (
                    <div>
                        <h3 className="text-xl font-medium text-gray-800 mt-4 mb-3">Inbound Stops:</h3>
                        <StopList
                            stops={line.arr_stop.map(stop => stop.name).reverse()}
                            selectedStop={selectedStop}
                            onSelectStop={onSelectStop}
                        />
                    </div>
                )}
            </div>
        </aside>
    );
};

LineDetailSideBar.propTypes = {
    line: linePropTypes.isRequired,
    onBack: PropTypes.func.isRequired,
    selectedStop: PropTypes.string,
    onSelectStop: PropTypes.func.isRequired,
    onTabSelect: PropTypes.func.isRequired,
};

export default LineDetailSideBar;
