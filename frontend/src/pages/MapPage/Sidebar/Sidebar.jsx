import PropTypes from "prop-types";
import { useState } from "react";
import TabSwitch from "@/pages/MapPage/SubComponents/TabSwitch/TabSwitch.jsx";
import NavigationTab from "@/pages/MapPage/PathfindingTab/NavigationTab.jsx";
import DistrictTab from "../DistrictTab/DistrictTab.jsx";
import { linePropTypes, stopPropTypes } from "@/utils/PropTypes.js";

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
  activeTab,
  onTabChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const resetSearch = () => {
    setSearchTerm(""); // Reset giá trị tìm kiếm
    onSearch(""); // Gọi hàm để cập nhật kết quả tìm kiếm
  };

  const tabs = [
    { key: 'search', label: 'Tìm Tuyến' },
    { key: 'pathfinding', label: 'Tìm Đường' },
    { key: 'districts', label: 'Quận' },
  ];

  const handleTabSelect = (key) => {
    if (activeTab === "pathfinding" && key === "search") {
      onClearPath();
    }
    onTabChange(key);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  // Filter lines based on the search query
  const filteredLines = lines.filter((line) =>
    line.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className='w-full bg-white border-r border-gray-200 h-full flex flex-col'>
      {/* Tab Switch */}
      <div className='border-b border-gray-200'>
        <div className='flex'>
          <TabSwitch tabs={tabs} activeTab={activeTab} onTabChange={handleTabSelect} />
        </div>
      </div>

      {/* Content Area */}
      <div className='flex-1 overflow-hidden'>
        {activeTab === "search" && (
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
                {filteredLines.map((line) => (
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

        {activeTab === "districts" && (
          <DistrictTab lines={lines} />
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
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
};

export default Sidebar;
