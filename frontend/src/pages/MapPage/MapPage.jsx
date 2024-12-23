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
        handleSearch
    } = useBusLinesViewModel();

    return (
        <div className="flex flex-col h-screen">
            <Header />
            <div className="flex flex-1">
                {!selectedLine && <Sidebar lines={lines} onSelectLine={handleLineSelect} onSearch={handleSearch} />}
                {selectedLine && (
                    <LineDetailSideBar
                        line={selectedLine}
                        onBack={handleBack}
                        selectedStop={selectedStop}
                        onSelectStop={handleSelectStop}
                    />
                )}
                <MapView stops={stops} busLines={busLines} selectedStopCoordinates={selectedStopCoordinates} />
            </div>
            <Footer />
        </div>
    );
};

export default MapPage;