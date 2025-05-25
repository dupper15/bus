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
                   onClearPath,
                 }) => {
  const [activeTab, setActiveTab] = useState("lines");
  const [searchTerm, setSearchTerm] = useState("");

  const resetSearch = () => {
    setSearchTerm(""); // Reset giá trị tìm kiếm
    onSearch(""); // Gọi hàm để cập nhật kết quả tìm kiếm
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
                    className={`flex-1 py-4 px-6  font-medium transition-colors
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
                <div className='flex-1  overflow-y-auto'>
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
                  </ul>
                </div>
              </div>
          )}

          {activeTab === "pathfinding" && (
              <div className='h-full overflow-y-auto'>
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
};

export default Sidebar;