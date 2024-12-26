import PropTypes from "prop-types";
import { useState } from "react";
import TabSwitch from "@/pages/MapPage/SubComponents/TabSwitch/TabSwitch.jsx";
import NavigationTab from "@/pages/MapPage/PathfindingTab/NavigationTab.jsx";

const Sidebar = ({
                     lines,
                     onSelectLine,
                     onSearch,
                     onFindPath,
                     busStops,
                     onInputFocus,
                     startCoordinates,
                     endCoordinates,
                 }) => {
    const [activeTab, setActiveTab] = useState("lines");
    const [searchTerm, setSearchTerm] = useState("");

    const tabs = [
        { key: "lines", label: "Lines" },
        { key: "pathfinding", label: "Pathfinding" },
    ];

    const handleTabSelect = (key) => setActiveTab(key);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        onSearch(value);
    };

    return (
        <aside className="w-1/4 bg-white shadow-md rounded-lg p-6 border-r border-gray-200 h-full flex flex-col">
            <TabSwitch
                tabs={tabs}
                onTabSelect={handleTabSelect}
                className="mb-6 border-b-2 border-gray-200"
            />

            {activeTab === "lines" && (
                <>
                    <div className="relative mb-4">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Search lines..."
                            className="w-full p-3 pl-10 text-gray-700 border rounded-lg shadow focus:outline-none focus:ring focus:ring-blue-300 transition"
                        />
                        <svg
                            className="absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                    </div>

                    <ul className="list-none flex-1 overflow-y-auto space-y-2 pr-2">
                        {lines.map((line) => (
                            <li key={line.id}>
                                <button
                                    onClick={() => onSelectLine(line)}
                                    className="w-full text-left p-4 bg-gray-50 hover:bg-blue-100 rounded-lg transition-all shadow-md"
                                >
                                    <div className="font-semibold text-lg text-gray-800">
                                        {line.name}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {line.start_place.name} - {line.end_place.name}
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {activeTab === "pathfinding" && (
                <div className="flex-1 overflow-y-auto">
                    <NavigationTab
                        onFindPath={onFindPath}
                        busStops={busStops}
                        onInputFocus={onInputFocus}
                        startCoordinates={startCoordinates}
                        endCoordinates={endCoordinates}
                        lines={lines}
                    />
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
