import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { IoIosArrowBack } from 'react-icons/io';
import { linePropTypes } from '@/utils/PropTypes.js';
import { LineDetailSkeleton, StopListSkeleton } from "@/components/ui/loadingSkeletons.jsx";
import StopList from "@/pages/MapPage/SubComponents/StopList/StopList.jsx";

/**
 * LineDetailSideBar component - Enhanced with loading skeletons
 * Shows detailed information about a selected bus line
 */
const LineDetailSideBar = ({
                               line,
                               onBack,
                               selectedStop,
                               onSelectStop,
                               onTabSelect,
                               onResetSearch,
                               isLoading = false,
                               isLoadingStops = false
                           }) => {
    const [activeTab, setActiveTab] = useState('details');

    const handleTabClick = (tabKey) => {
        setActiveTab(tabKey);
        onTabSelect(tabKey);
    };

    const handleBackClick = () => {
        onResetSearch(''); // Reset search when going back
        onBack();
    };

    // Show loading skeleton if line data is loading
    if (isLoading || !line) {
        return <LineDetailSkeleton />;
    }

    return (
        <div className="h-full bg-white flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                    <button
                        onClick={handleBackClick}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Go back to lines list"
                    >
                        <IoIosArrowBack className="text-gray-600 text-lg" />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900">{line.name}</h2>
                </div>

                {/* Line Information */}
                <div className="space-y-3">
                    <div>
                        <div className="text-sm text-gray-500 mb-1">Start Place</div>
                        <div className="font-medium text-gray-900">{line.start_place?.name || 'Unknown'}</div>
                    </div>

                    <div>
                        <div className="text-sm text-gray-500 mb-1">End Place</div>
                        <div className="font-medium text-gray-900">{line.end_place?.name || 'Unknown'}</div>
                    </div>

                    <div>
                        <div className="text-sm text-gray-500 mb-1">Duration</div>
                        <div className="font-medium text-gray-900">{line.time || 'Unknown'}</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <div className="flex">
                    <button
                        onClick={() => handleTabClick('details')}
                        className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                            activeTab === 'details'
                                ? 'text-green-500 border-b-2 border-green-500'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Details
                    </button>
                    <button
                        onClick={() => handleTabClick('outbound')}
                        className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                            activeTab === 'outbound'
                                ? 'text-green-500 border-b-2 border-green-500'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Outbound
                    </button>
                    <button
                        onClick={() => handleTabClick('inbound')}
                        className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
                            activeTab === 'inbound'
                                ? 'text-green-500 border-b-2 border-green-500'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Inbound
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'details' && (
                    <div className="p-4">
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-medium text-gray-900 mb-2">Route Information</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Stops:</span>
                                        <span className="font-medium">
                                            {line.arr_stop ? line.arr_stop.length + 2 : 'Unknown'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Route Type:</span>
                                        <span className="font-medium">City Bus</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Operating Hours:</span>
                                        <span className="font-medium">5:00 - 22:00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Frequency:</span>
                                        <span className="font-medium">10-15 mins</span>
                                    </div>
                                </div>
                            </div>

                            {/* Additional route details */}
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="font-medium text-blue-900 mb-2">Service Notes</h3>
                                <p className="text-sm text-blue-800">
                                    This route operates daily with regular service.
                                    Please check current schedules as times may vary during holidays.
                                </p>
                            </div>

                            {/* Accessibility info */}
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="font-medium text-green-900 mb-2">Accessibility</h3>
                                <div className="flex items-center gap-2 text-sm text-green-800">
                                    <span>♿</span>
                                    <span>Wheelchair accessible buses available</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {(activeTab === 'outbound' || activeTab === 'inbound') && (
                    <div className="py-4">
                        {isLoadingStops ? (
                            <StopListSkeleton count={12} />
                        ) : line.arr_stop && line.arr_stop.length > 0 ? (
                            <>
                                {/* Direction header */}
                                <div className="px-4 mb-4">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <h3 className="font-medium text-gray-900 mb-1">
                                            {activeTab === 'outbound' ? 'Outbound Direction' : 'Inbound Direction'}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {activeTab === 'outbound'
                                                ? `${line.start_place?.name} → ${line.end_place?.name}`
                                                : `${line.end_place?.name} → ${line.start_place?.name}`
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* Stops list */}
                                <StopList
                                    stops={line.arr_stop.map(stop => stop.name)}
                                    selectedStop={selectedStop}
                                    onSelectStop={onSelectStop}
                                />
                            </>
                        ) : (
                            <div className="p-6 text-center text-gray-500">
                                <div className="space-y-2">
                                    <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-2 4h2M7 7h2v6H7z" />
                                    </svg>
                                    <div className="text-sm">No stops information available</div>
                                    <div className="text-xs">Stop data may be loading or unavailable</div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

LineDetailSideBar.propTypes = {
    line: linePropTypes,
    onBack: PropTypes.func.isRequired,
    selectedStop: PropTypes.string,
    onSelectStop: PropTypes.func.isRequired,
    onTabSelect: PropTypes.func.isRequired,
    onResetSearch: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    isLoadingStops: PropTypes.bool,
};

export default LineDetailSideBar;