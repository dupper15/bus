import PropTypes from "prop-types";
import { useState } from "react";
import NavigationTab from "@/pages/MapPage/PathfindingTab/NavigationTab.jsx";
import {BusLinesListSkeleton, NavigationTabSkeleton} from "@/components/ui/loadingSkeletons.jsx";

const Sidebar = ({
                     lines,
                     onSelectLine,
                     onSearch,
                     onFindPath,
                     busStops,
                     onInputFocus,
                     startCoordinates,
                     endCoordinates,
                     onClearPath,
                     onMapClick, // New prop for map click handling
                     mapRef, // Map reference
                     isLoading = false,
                 }) => {
    const [activeTab, setActiveTab] = useState("lines");
    const [searchTerm, setSearchTerm] = useState("");

    const resetSearch = () => {
        setSearchTerm("");
        onSearch("");
    };

    const tabs = [
        { key: "lines", label: "Lines" },
        { key: "pathfinding", label: "Navigation" },
    ];

    const handleTabSelect = (key) => {
        // Clear path when switching from pathfinding to lines tab
        if (activeTab === "pathfinding" && key === "lines") {
            onClearPath();
        }
        setActiveTab(key);
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        onSearch(value);
    };

    return (
        <aside className='w-full bg-white border-r border-gray-200 h-full flex flex-col'>
            {/* Tab Switch */}
            <div className='border-b border-gray-200'>
                <div className='flex'>
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => handleTabSelect(tab.key)}
                            className={`flex-1 py-4 px-6 font-medium transition-colors
                                ${
                                activeTab === tab.key
                                    ? "text-green-500 border-b-2 border-green-500"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className='flex-1 overflow-hidden'>
                {activeTab === "lines" && (
                    <div className='flex flex-col h-full'>
                        {/* Search Box */}
                        <div className='p-4 border-b border-gray-200'>
                            <div className='relative'>
                                <input
                                    type='text'
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    placeholder='Search lines...'
                                    className='w-full p-2 pl-8 text-sm text-gray-700 border rounded-md
                                             focus:outline-none focus:ring-1 focus:ring-green-500
                                             focus:border-green-500'
                                />
                                <svg
                                    className='absolute top-1/2 left-2.5 -translate-y-1/2 h-4 w-4 text-gray-400'
                                    xmlns='http://www.w3.org/2000/svg'
                                    viewBox='0 0 24 24'
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth='2'>
                                    <circle cx='11' cy='11' r='8' />
                                    <line x1='21' y1='21' x2='16.65' y2='16.65' />
                                </svg>
                            </div>
                        </div>

                        {/* Lines List */}
                        <div className='flex-1 overflow-y-auto'>
                            {isLoading ? (
                                <BusLinesListSkeleton count={8} />
                            ) : (
                                <ul className='p-2 space-y-2'>
                                    {lines.map((line) => (
                                        <li key={line.id}>
                                            <button
                                                onClick={() => {
                                                    resetSearch();
                                                    onSelectLine(line);
                                                }}
                                                className='w-full text-left p-3 bg-white hover:bg-green-50
                                                       rounded-md transition-colors border border-gray-200
                                                       hover:border-green-200'>
                                                <div className='font-medium text-gray-900'>
                                                    {line.name}
                                                </div>
                                                <div className='text-sm text-gray-500 mt-1'>
                                                    {line.start_place.name} - {line.end_place.name}
                                                </div>
                                            </button>
                                        </li>
                                    ))}
                                    {lines.length === 0 && !isLoading && (
                                        <li className="p-6 text-center text-gray-500">
                                            <div className="space-y-2">
                                                <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467-.881-6.08-2.33" />
                                                </svg>
                                                <div className="text-sm">No bus lines found</div>
                                                {searchTerm && (
                                                    <div className="text-xs">Try adjusting your search terms</div>
                                                )}
                                            </div>
                                        </li>
                                    )}
                                </ul>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "pathfinding" && (
                    <div className='h-full overflow-y-auto'>
                        {isLoading ? (
                            <NavigationTabSkeleton />
                        ) : (
                            <NavigationTab
                                onFindPath={onFindPath}
                                busStops={busStops}
                                onInputFocus={onInputFocus}
                                startCoordinates={startCoordinates}
                                endCoordinates={endCoordinates}
                                lines={lines}
                                onMapClick={onMapClick} // Pass map click handler
                                mapRef={mapRef} // Pass map reference
                            />
                        )}
                    </div>
                )}
            </div>
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
    onClearPath: PropTypes.func.isRequired,
    onMapClick: PropTypes.func, // Map click handler
    mapRef: PropTypes.object, // Map reference
    isLoading: PropTypes.bool,
};

export default Sidebar;