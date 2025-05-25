import { useState, useEffect } from "react";
import MapView from "@/pages/MapPage/MapView/MapView.jsx";
import useBusLinesViewModel from "@/pages/MapPage/ViewModel/BusLinesViewModel/BusLinesViewModel.js";
import Header from "@/components/Header/Header.jsx";
import Sidebar from "@/pages/MapPage/Sidebar/Sidebar.jsx";
import LineDetailSideBar from "@/pages/MapPage/LineDetailSideBar/LineDetailSideBar.jsx";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

/**
 * MapPage component - Main page for the BusMap application
 *
 * @returns {JSX.Element} - Map page component
 */
const MapPage = () => {
    const [isMapExpanded, setIsMapExpanded] = useState(false);

    // Use enhanced BusLinesViewModel with Strategy and Composite patterns
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
        setPath, // Exposed from ViewModel for path operations
    } = useBusLinesViewModel();

    // Toggle sidebar visibility
    const toggleMap = () => setIsMapExpanded(!isMapExpanded);

    // Clear navigation path
    const handleClearPath = () => {
        setPath([]); // Clear the path using method from ViewModel
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
                            />
                        ) : (
                            <LineDetailSideBar
                                line={selectedLine}
                                onBack={handleBack}
                                selectedStop={selectedStop}
                                onSelectStop={handleSelectStop}
                                onTabSelect={setViewMode}
                                onResetSearch={handleSearch} // Pass empty string to reset search
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
                </div>

                {/* Error notification */}
                {error && (
                    <div
                        className='absolute bottom-4 left-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md z-30'
                        onClick={() => setError(null)}>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapPage;