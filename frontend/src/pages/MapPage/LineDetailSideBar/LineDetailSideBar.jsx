// frontend/src/pages/MapPage/LineDetailSideBar/LineDetailSideBar.jsx
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
        <aside className="w-1/4 bg-white shadow-lg p-6 border-r border-gray-200">
            <button
                className="mb-4 text-blue-600 hover:underline"
                onClick={onBack}
            >
                &larr; Back
            </button>
            <h2 className="text-2xl font-semibold mb-4">{line.name}</h2>
            <TabSwitch tabs={tabs} onTabSelect={handleTabSelect} />
            {activeTab === "details" && (
                <div className="mb-4">
                    <p className="text-gray-700"><strong>Start Place:</strong> {line.start_place.name}</p>
                    <p className="text-gray-700"><strong>End Place:</strong> {line.end_place.name}</p>
                    <p className="text-gray-700"><strong>Time:</strong> {line.time} minutes</p>
                </div>
            )}
            {activeTab === "outbound" && (
                <div>
                    <h3 className="text-xl font-semibold mt-4 mb-2">Outbound Stops:</h3>
                    <StopList
                        stops={line.arr_stop.map(stop => stop.name)}
                        selectedStop={selectedStop}
                        onSelectStop={onSelectStop}
                    />
                </div>
            )}
            {activeTab === "inbound" && (
                <div>
                    <h3 className="text-xl font-semibold mt-4 mb-2">Inbound Stops:</h3>
                    <StopList
                        stops={line.arr_stop.map(stop => stop.name).reverse()}
                        selectedStop={selectedStop}
                        onSelectStop={onSelectStop}
                    />
                </div>
            )}
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