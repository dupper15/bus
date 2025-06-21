import { useRef, useState } from "react";
import useBusLinesViewModel from "@/pages/MapPage/ViewModel/BusLinesViewModel/BusLinesViewModel.js";
import Header from "@/pages/MapPage/Header/Header.jsx";
import LineDetailSideBar from "@/pages/MapPage/LineDetailSideBar/LineDetailSideBar.jsx";
import Sidebar from "@/pages/MapPage/Sidebar/Sidebar.jsx";
import MapView from "@/pages/MapPage/MapView/MapView.jsx";
import Footer from "@/pages/MapPage/Footer/Footer.jsx";
/**
 * Enhanced MapPage with coordinate selection support
 */
const MapPage = () => {
    const mapRef = useRef(null); // Reference to map instance
    const [customClickHandler, setCustomClickHandler] = useState(null);

    const {
        lines,
        stops,
        busLines,
        selectedLine,
        selectedStop,
        selectedStopCoordinates,
        path,
        error,
        handleSearch,
        handleLineSelect,
        handleBack,
        handleSelectStop,
        handleFindPath,
        handleInputFocus,
        handleMapClick,
        startCoordinates,
        endCoordinates,
        viewMode,
        setViewMode,
        clearPath,
        isLoadingLines,
        isLoadingStops,
        isLoadingBusLine,
    } = useBusLinesViewModel();

    // Handle custom map click from NavigationTab
    const handleCustomMapClick = (clickHandler) => {
        setCustomClickHandler(() => clickHandler);
    };

    // Handle regular map clicks (for backward compatibility)
    const handleRegularMapClick = (coordinates) => {
        // Only use regular click handler if no custom handler is set
        if (!customClickHandler) {
            handleMapClick(coordinates);
        }
    };

    return (
        <div className="h-screen w-full flex flex-col bg-gray-50">
            <Header />

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-96 flex-shrink-0">
                    {selectedLine ? (
                        <LineDetailSideBar
                            line={selectedLine}
                            onBack={handleBack}
                            selectedStop={selectedStop}
                            onSelectStop={handleSelectStop}
                            onTabSelect={setViewMode}
                            onResetSearch={handleSearch}
                            isLoading={isLoadingBusLine}
                            isLoadingStops={isLoadingStops}
                        />
                    ) : (
                        <Sidebar
                            lines={lines}
                            onSelectLine={handleLineSelect}
                            onSearch={handleSearch}
                            onFindPath={handleFindPath}
                            busStops={stops}
                            onInputFocus={handleInputFocus}
                            startCoordinates={startCoordinates}
                            endCoordinates={endCoordinates}
                            onClearPath={clearPath}
                            onMapClick={handleCustomMapClick} // Pass custom click handler
                            mapRef={mapRef} // Pass map reference
                            isLoading={isLoadingLines}
                        />
                    )}
                </div>

                {/* Map */}
                <div className="flex-1">
                    <MapView
                        mapData={stops}
                        busLines={busLines}
                        stops={stops}
                        selectedStopCoordinates={selectedStopCoordinates}
                        mode={viewMode}
                        path={path}
                        onMapClick={handleRegularMapClick} // Regular map click handler
                        clickHandler={customClickHandler} // Custom click handler from NavigationTab
                        mapRef={mapRef} // Map reference
                    />
                </div>
            </div>

            <Footer />

            {/* Error Display */}
            {error && (
                <div className="fixed bottom-4 right-4 max-w-sm">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
                        <div className="flex">
                            <div className="py-1">
                                <svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
                                </svg>
                            </div>
                            <div>
                                <p className="font-bold">Error</p>
                                <p className="text-sm">{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapPage;