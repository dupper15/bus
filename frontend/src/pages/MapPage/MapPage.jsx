import { useEffect } from 'react';
import MapView from "@/pages/MapPage/MapView/MapView.jsx";
import useBusLinesViewModel from "@/pages/MapPage/ViewModel/BusLinesViewModel/BusLinesViewModel.js";
import useMapViewModel from "@/pages/MapPage/ViewModel/MapViewModel/MapViewModel.js";
import Header from "@/components/Header/Header.jsx";
import Footer from "@/components/Footer/Footer.jsx";
import Sidebar from "@/pages/MapPage/Sidebar/Sidebar.jsx";

const MapPage = () => {
    const { lines, fetchLines } = useBusLinesViewModel();
    const { mapData } = useMapViewModel();

    useEffect(() => {
        fetchLines();
    }, [fetchLines]);

    const handleLineSelect = (id) => {
        console.log(`Selected line ID: ${id}`);
    };

    return (
        <div className="flex flex-col h-screen">
            <Header />
            <div className="flex flex-1">
                <Sidebar lines={lines} onSelectLine={handleLineSelect} />
                <MapView mapData={mapData} />
            </div>
            <Footer />
        </div>
    );
};

export default MapPage;
