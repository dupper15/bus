import MapView from "@/pages/MapPage/MapView/MapView.jsx";
import useBusLinesViewModel from "@/pages/MapPage/ViewModel/BusLinesViewModel/BusLinesViewModel.js";
import Header from "@/components/Header/Header.jsx";
import Footer from "@/components/Footer/Footer.jsx";
import Sidebar from "@/pages/MapPage/Sidebar/Sidebar.jsx";
import LineDetailSideBar from "@/pages/MapPage/LineDetailSideBar/LineDetailSideBar.jsx";

const MapPage = () => {
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
        handleFindPath,
        handleInputFocus,
        handleMapClick,
        startCoordinates,
        endCoordinates,
        viewMode,
        setViewMode
    } = useBusLinesViewModel();

    return (
        <div className="flex flex-col h-screen bg-gradient-to-r from-blue-50 to-gray-50">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <div className="flex flex-1 h-[calc(100%-120px)]">
                {/* Sidebar Section */}
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
                        busLines={busLines}
                    />
                ) : (
                    <LineDetailSideBar
                        line={selectedLine}
                        onBack={handleBack}
                        selectedStop={selectedStop}
                        onSelectStop={handleSelectStop}
                        onTabSelect={setViewMode} // Pass the setViewMode function to LineDetailSideBar
                    />
                )}

                {/* Map Section */}
                <div className="flex-1 bg-white shadow-md rounded-lg overflow-hidden relative">
                    <MapView
                        stops={stops}
                        busLines={busLines}
                        selectedStopCoordinates={selectedStopCoordinates}
                        mode={viewMode} // Pass the viewMode to MapView
                        path={path}
                        error={error}
                        onMapClick={handleMapClick}
                    />
                    {/* Error Notification */}
                    {error && (
                        <div className="absolute bottom-4 left-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md">
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default MapPage;
