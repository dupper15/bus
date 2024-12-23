import { useEffect } from "react";
import MapView from "@/pages/MapPage/MapView/MapView.jsx";
import useBusLinesViewModel from "@/pages/MapPage/ViewModel/BusLinesViewModel/BusLinesViewModel.js";
import Header from "@/components/Header/Header.jsx";
import Footer from "@/components/Footer/Footer.jsx";
import Sidebar from "@/pages/MapPage/Sidebar/Sidebar.jsx";
import LineDetailSideBar from "@/pages/MapPage/LineDetailSideBar/LineDetailSideBar.jsx";

const MapPage = () => {
    const {
        lines, fetchLines, stops, fetchStops, busLines, setBusLines, fetchBusLine, handleSearch, selectedLine, setSelectedLine
    } = useBusLinesViewModel();

    useEffect(() => {
        fetchStops().then(); // Fetch initial stops
        fetchLines().then(); // Fetch initial lines
    }, [fetchLines, fetchStops]);

    const handleLineSelect = (line) => {
        setSelectedLine(line);
        fetchBusLine(line);
    };


    const handleBack = () => {
        setSelectedLine(null);
        setBusLines([]);
    };

    return (
        <div className="flex flex-col h-screen">
            <Header />
            <div className="flex flex-1">
                {!selectedLine && <Sidebar lines={lines} onSelectLine={handleLineSelect} onSearch={handleSearch} />}
                {selectedLine && <LineDetailSideBar line={selectedLine} onBack={handleBack} />}
                <MapView stops={stops} busLines={busLines} />
            </div>
            <Footer />
        </div>
    );
};

export default MapPage;