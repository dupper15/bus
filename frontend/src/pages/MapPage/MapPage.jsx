import { useState } from "react";
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

    const [path, setPath] = useState([]);
    const [error, setError] = useState(null);
    const [focusedInput, setFocusedInput] = useState(null);
    const [startCoordinates, setStartCoordinates] = useState("");
    const [endCoordinates, setEndCoordinates] = useState("");

    const handleFindPath = (newPath, newError) => {
        setPath(newPath); // Update path to display on the map
        setError(newError); // Display error if necessary
    };

    const handleInputFocus = (inputName) => {
        setFocusedInput(inputName);
    };

    const handleMapClick = (coordinates) => {
        if (focusedInput === "start") {
            setStartCoordinates(coordinates.join(", "));
        } else if (focusedInput === "end") {
            setEndCoordinates(coordinates.join(", "));
        }
    };

    const [viewMode, setViewMode] = useState("outbound");

    return (
        <div className="flex flex-col h-screen w-screen bg-gray-100">
            <Header />
            <div className="flex flex-1 h-[calc(100%-120px)]">
                {!selectedLine && <Sidebar lines={lines} onSelectLine={handleLineSelect} onSearch={handleSearch} onFindPath={handleFindPath} busStops={stops} onInputFocus={handleInputFocus} startCoordinates={startCoordinates} endCoordinates={endCoordinates} />}
                {selectedLine && (
                    <LineDetailSideBar
                        line={selectedLine}
                        onBack={handleBack}
                        selectedStop={selectedStop}
                        onSelectStop={handleSelectStop}
                        onTabSelect={setViewMode} // Pass the setViewMode function to LineDetailSideBar
                    />
                )}
                <div className="flex-1">
                    <MapView
                        stops={stops}
                        busLines={busLines}
                        selectedStopCoordinates={selectedStopCoordinates}
                        mode={viewMode} // Pass the viewMode to MapView
                        path={path}
                        error={error}
                        onMapClick={handleMapClick}
                    />
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default MapPage;