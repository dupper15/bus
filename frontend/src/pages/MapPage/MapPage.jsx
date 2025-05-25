import { useState, useEffect } from "react";
import MapView from "@/pages/MapPage/MapView/MapView.jsx";
import useBusLinesViewModel from "@/pages/MapPage/ViewModel/BusLinesViewModel/BusLinesViewModel.js";
import Header from "@/components/Header/Header.jsx";
import Sidebar from "@/pages/MapPage/Sidebar/Sidebar.jsx";
import LineDetailSideBar from "@/pages/MapPage/LineDetailSideBar/LineDetailSideBar.jsx";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

/**
 * MapPage component - Main page for the BusMap application
 * Enhanced with loading states and skeletons
 *
 * @returns {JSX.Element} - Map page component
 */
const MapPage = () => {
    const [isMapExpanded, setIsMapExpanded] = useState(false);

    // Use enhanced BusLinesViewModel with loading states
    const {
        lines,
        stops,
        busLines,
        selectedLine,
        selectedStop,
        selectedStopCoordinates,
        handleLineSelect,
        handleBack,
        handleSelectStop,
        handleSearch,
        path,
        error,
        setError,
        handleFindPath,
        handleInputFocus,
        handleMapClick,
        startCoordinates,
        endCoordinates,
        viewMode,
        setViewMode,
        setPath,
        clearPath,

        // Loading states
        isLoadingLines,
        isLoadingStops,
        isLoadingBusLine,
        isLoadingRoute,
        isLoading,
        hasData
    } = useBusLinesViewModel();

    // Toggle sidebar visibility
    const toggleMap = () => setIsMapExpanded(!isMapExpanded);

    // Enhanced clear path function that also clears bus lines
    const handleClearPath = () => {
        clearPath(); // Clear navigation path using ViewModel method
        if (path.length > 0) {
            // If there was a path, also clear any bus line display
            setBusLines([]);
        }
    };

    // Auto-clear error messages after timeout
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [error, setError]);

    return (
        <div className='flex flex-col h-screen'>
            {/* Header section */}
            <div className='flex-none'>
                <Header />
            </div>

            {/* Main content section */}
            <div className='flex-1 relative bg-white'>
                {/* Map container */}
                <div className='absolute inset-0'>
                    <MapView
                        stops={stops}
                        busLines={busLines}
                        selectedStopCoordinates={selectedStopCoordinates}
                        mode={viewMode}
                        path={path}
                        error={error}
                        onMapClick={handleMapClick}
                        isLoading={isLoadingStops || isLoadingBusLine}
                    />
                </div>

                {/* Sidebar with animation */}
                <div
                    className={`
                        absolute top-0 left-0 h-full pb-4
                        ${isMapExpanded ? "w-0 -translate-x-full" : "w-[360px] translate-x-0"}
                        transition-all duration-300 ease-in-out
                        bg-white shadow-xl z-10
                    `}>
                    <div className="h-full overflow-y-auto w-full">
                        {!selectedLine ? (
                            <Sidebar
                                lines={lines}
                                onSelectLine={handleLineSelect}
                                onSearch={handleSearch}
                                onFindPath={handleFindPath}
                                busStops={stops}
                                onInputFocus={handleInputFocus}
                                startCoordinates={startCoordinates}
                                endCoordinates={endCoordinates}
                                onClearPath={handleClearPath}
                                isLoading={isLoadingLines}
                            />
                        ) : (
                            <LineDetailSideBar
                                line={selectedLine}
                                onBack={handleBack}
                                selectedStop={selectedStop}
                                onSelectStop={handleSelectStop}
                                onTabSelect={setViewMode}
                                onResetSearch={handleSearch}
                                isLoading={false} // Line is already loaded if we're here
                                isLoadingStops={isLoadingBusLine}
                            />
                        )}
                    </div>
                </div>

                {/* Control buttons container */}
                <div
                    className={`
                        absolute top-4 transition-all duration-300
                        ${isMapExpanded ? "left-4" : "left-96"}
                        flex items-center gap-2 z-20
                    `}>
                    <button
                        onClick={toggleMap}
                        aria-label={isMapExpanded ? "Show sidebar" : "Hide sidebar"}
                        className='flex items-center justify-center w-10 h-10 bg-white text-green-500 rounded-lg shadow-md hover:bg-green-50 transition-colors'>
                        {isMapExpanded ? <IoIosArrowForward /> : <IoIosArrowBack />}
                    </button>

                    {/* Loading indicator for map operations */}
                    {(isLoadingBusLine || isLoadingRoute) && (
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-md">
                            <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm text-gray-600">
                                {isLoadingRoute ? 'Finding route...' : 'Loading...'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Error notification */}
                {error && (
                    <div
                        className='absolute bottom-4 left-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md z-30 max-w-sm cursor-pointer'
                        onClick={() => setError(null)}>
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1">
                                <div className="font-medium text-sm">Error</div>
                                <div className="text-sm">{error}</div>
                                <div className="text-xs mt-1 opacity-75">Click to dismiss</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading overlay for initial data load */}
                {isLoading && !hasData && (
                    <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-40">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <div className="space-y-2">
                                <div className="text-lg font-medium text-gray-900">Loading BusMap</div>
                                <div className="text-sm text-gray-600">
                                    {isLoadingLines && isLoadingStops ? 'Loading bus lines and stops...' :
                                        isLoadingLines ? 'Loading bus lines...' :
                                            isLoadingStops ? 'Loading bus stops...' :
                                                'Preparing map...'}
                                </div>
                            </div>

                            {/* Progress indicators */}
                            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                                <div className={`flex items-center gap-1 ${!isLoadingLines ? 'text-green-600' : ''}`}>
                                    {!isLoadingLines ? (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                    <span>Lines</span>
                                </div>
                                <div className={`flex items-center gap-1 ${!isLoadingStops ? 'text-green-600' : ''}`}>
                                    {!isLoadingStops ? (
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                    <span>Stops</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapPage;