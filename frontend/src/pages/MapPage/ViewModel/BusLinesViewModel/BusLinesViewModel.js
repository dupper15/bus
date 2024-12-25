import { useState, useCallback, useEffect } from "react";
import LineService from "@/services/LineService";
import StopService from "@/services/StopService";
import MapBoxService from "@/services/MapboxService.js";
import { transformLine, transformStop } from "@/utils/Transformer.js";

const useBusLinesViewModel = () => {
    const [stops, setStops] = useState([]);
    const [lines, setLines] = useState([]);
    const [busLines, setBusLines] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLine, setSelectedLine] = useState(null);
    const [selectedStop, setSelectedStop] = useState(null);
    const [selectedStopCoordinates, setSelectedStopCoordinates] = useState(null);

    const fetchLines = useCallback(async () => {
        try {
            const response = await LineService.getLines();
            console.log("response", response)
            const rawLines = response.data;
            console.log("rawlines", rawLines);
            console.log("first line", rawLines[0]._id);
            const transformedLines = rawLines.map(transformLine);
            setLines(transformedLines);
        } catch (error) {
            console.error("Error fetching lines:", error);
        }
    }, []);

    const fetchStops = useCallback(async () => {
        try {
            const response = await StopService.getStops();
            const rawStops = response.data;
            const transformedStops = rawStops.map(transformStop);
            setStops(transformedStops);
        } catch (error) {
            console.error("Failed to fetch stops:", error);
        }
    }, []);

    const fetchBusLine = async (line) => {
        try {
            const stops = [line.start_place, ...line.arr_stop, line.end_place];
            const route = await MapBoxService.fetchBusLineRoute(stops);
            setBusLines([{ ...line, route }]); // Clear previous lines and set the new one
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const handleLineSelect = (line) => {
        setSelectedLine(line);
        fetchBusLine(line).then();
    };

    const handleBack = () => {
        setSelectedLine(null);
        setBusLines([]);
        setSelectedStop(null);
        setSelectedStopCoordinates(null);
    };

    const handleSelectStop = (stop) => {
        setSelectedStop(stop);
        const selectedStopData = stops.find(s => s.name === stop);
        if (selectedStopData) {
            setSelectedStopCoordinates([selectedStopData.pointX, selectedStopData.pointY]);
        }
    };

    useEffect(() => {
        fetchStops().then();
        fetchLines().then();
    }, [fetchLines, fetchStops]);

    const filteredLines = lines.filter((line) =>
        line.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
        lines: filteredLines,
        fetchLines,
        stops,
        fetchStops,
        busLines,
        setBusLines,
        fetchBusLine,
        handleSearch,
        selectedLine,
        setSelectedLine,
        selectedStop,
        setSelectedStop,
        selectedStopCoordinates,
        handleLineSelect,
        handleBack,
        handleSelectStop
    };
};

export default useBusLinesViewModel;