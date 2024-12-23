import {useEffect} from "react";
import MapView from "@/pages/MapPage/MapView/MapView.jsx";
import useBusLinesViewModel from "@/pages/MapPage/ViewModel/BusLinesViewModel/BusLinesViewModel.js";
import Header from "@/components/Header/Header.jsx";
import Footer from "@/components/Footer/Footer.jsx";
import Sidebar from "@/pages/MapPage/Sidebar/Sidebar.jsx";

const MapPage = () => {
    const {lines, fetchLines, stops, fetchStops, busLines, fetchBusLine, handleSearch} = useBusLinesViewModel();

    useEffect(() => {
        fetchStops().then(); // Fetch initial stops
        fetchLines().then(); // Fetch initial lines
    }, [fetchLines, fetchStops]);

    const handleLineSelect = (id) => {
        const selectedLine = lines.find((line) => line.id === id);
        console.log("selectedLine", selectedLine);
        if (selectedLine) {
            fetchBusLine(selectedLine).then(); // Fetch and render the line route
        }
    };

    return (<div className="flex flex-col h-screen">
        <Header/>
        <div className="flex flex-1">
            <Sidebar lines={lines} onSelectLine={handleLineSelect} onSearch={handleSearch}/>
            <MapView stops={stops} busLines={busLines}/>
        </div>
        <Footer/>
    </div>);
};

export default MapPage;
