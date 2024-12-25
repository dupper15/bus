import PropTypes from "prop-types";
import { useState } from "react";
import TabSwitch from "@/pages/MapPage/SubComponents/TabSwitch/TabSwitch.jsx";
import NavigationTab from "@/pages/MapPage/PathfindingTab/NavigationTab.jsx";

const Sidebar = ({ lines, onSelectLine, onSearch, onFindPath, busStops, onInputFocus, startCoordinates, endCoordinates }) => {
    const [activeTab, setActiveTab] = useState("lines");
    const [searchTerm, setSearchTerm] = useState("");

    const tabs = [
        { key: "lines", label: "Lines" },
        { key: "pathfinding", label: "Pathfinding" },
    ];

    const handleTabSelect = (key) => {
        setActiveTab(key);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        onSearch(e.target.value);
    };

    return (
        <aside className="w-1/4 bg-white shadow-lg p-6 border-r border-gray-200 h-full flex flex-col">
            <TabSwitch tabs={tabs} onTabSelect={handleTabSelect}/>
            {activeTab === "lines" && (
                <>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search lines..."
                        className="w-full p-2 mb-4 border border-gray-300 rounded"
                    />
                    <ul className="list-none pr-2 flex-1 overflow-y-auto">
                        {lines.map((line) => (
                            <li key={line.id} className="mb-2">
                                <button
                                    onClick={() => onSelectLine(line)}
                                    className="w-full text-left p-2 bg-gray-100 hover:bg-gray-200 rounded h-20"
                                >
                                    <div className="font-semibold">{line.name}</div>
                                    <div
                                        className="text-sm text-gray-600">{line.start_place.name} - {line.end_place.name}</div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            )}
            {activeTab === "pathfinding" && (
                <div className="flex-1 overflow-y-auto">
                    <NavigationTab onFindPath={onFindPath} busStops={busStops} onInputFocus={onInputFocus}
                                   startCoordinates={startCoordinates} endCoordinates={endCoordinates}/>
                </div>
            )}
        </aside>
    );
};

Sidebar.propTypes = {
    lines: PropTypes.arrayOf(PropTypes.object).isRequired,
    onSelectLine: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
    onFindPath: PropTypes.func.isRequired,
    busStops: PropTypes.array.isRequired,
    onInputFocus: PropTypes.func.isRequired,
    startCoordinates: PropTypes.string,
    endCoordinates: PropTypes.string,
};

export default Sidebar;