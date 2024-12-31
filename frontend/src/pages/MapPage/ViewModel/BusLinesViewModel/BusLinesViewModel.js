import {useState, useCallback, useEffect} from "react";
import LineService from "@/services/LineService";
import StopService from "@/services/StopService";
import MapBoxService from "@/services/MapboxService.js";
import {transformLine, transformStop} from "@/utils/Transformer.js";

const useBusLinesViewModel = () => {
    // State variables
    const [stops, setStops] = useState([]);
    const [lines, setLines] = useState([]);
    const [busLines, setBusLines] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedLine, setSelectedLine] = useState(null);
    const [selectedStop, setSelectedStop] = useState(null);
    const [selectedStopCoordinates, setSelectedStopCoordinates] = useState(null);
    const [path, setPath] = useState([]);
    const [error, setError] = useState(null);
    const [focusedInput, setFocusedInput] = useState(null);
    const [startCoordinates, setStartCoordinates] = useState("");
    const [endCoordinates, setEndCoordinates] = useState("");
    const [viewMode, setViewMode] = useState("outbound");

    useEffect(() => {
        console.log("checker", path);
    }, [path]);
    
    // Fetch lines
    const fetchLines = useCallback(async () => {
        try {
            const response = await LineService.getLines();
            const rawLines = response.data;
            const sortedLines = rawLines.map(transformLine).sort((a, b) => {
                // Extract numbers from line names and compare them numerically
                const numA = parseInt(a.name.match(/\d+/)[0]);
                const numB = parseInt(b.name.match(/\d+/)[0]);
                return numA - numB;
            });
            setLines(sortedLines);
        } catch (error) {
            console.error("Error fetching lines:", error);
        }
    }, []);

    // Fetch stops
    const fetchStops = useCallback(async () => {
        try {
            const response = await StopService.getStops();
            const rawStops = response.data;
            setStops(rawStops.map(transformStop));
        } catch (error) {
            console.error("Failed to fetch stops:", error);
        }
    }, []);

    // Fetch bus line route
    const fetchBusLine = async (line) => {
        try {
            const stopsSequence = viewMode === "outbound" ? [line.end_place, ...line.arr_stop.slice().reverse(), line.start_place] : [line.start_place, ...line.arr_stop, line.end_place];
            const route = await MapBoxService.fetchBusLineRoute(stopsSequence);
            setBusLines([{...line, route}]);
        } catch (error) {
            console.error("Error fetching bus line route:", error);
        }
    };
    useEffect(() => {
        if (busLines.length > 0) {
            console.log("Bus lines", busLines);
        }
    }, [busLines]);

    // Handle search
    const handleSearch = (query) => setSearchQuery(query);

    // Handle line selection
    const handleLineSelect = (line) => {
        setSelectedLine(line);
        setBusLines([]); // Clear bus lines to indicate loading
        fetchBusLine(line);
    };

    // Handle back
    const handleBack = () => {
        setSelectedLine(null);
        setBusLines([]);
        setSelectedStop(null);
        setSelectedStopCoordinates(null);
    };

    // Handle stop selection
    const handleSelectStop = (stop) => {
        setSelectedStop(stop);
        const selectedStopData = stops.find((s) => s.name === stop);
        if (selectedStopData) {
            setSelectedStopCoordinates([selectedStopData.pointX, selectedStopData.pointY]);
        }
    };

    // Handle path finding
    const handleFindPath = (newPath, newError) => {
        if (newPath) {
            setPath(newPath);

        } else {
            setError(newError);
        }
    };

    // Handle input focus
    const handleInputFocus = (inputName) => setFocusedInput(inputName);

    // Handle map click
    const handleMapClick = (coordinates) => {
        if (focusedInput === "start") {
            setStartCoordinates(coordinates.join(", "));
        } else if (focusedInput === "end") {
            setEndCoordinates(coordinates.join(", "));
        }
    };

    // Fetch stops and lines on mount
    useEffect(() => {
        fetchStops();
        fetchLines();
    }, [fetchLines, fetchStops]);

    // Update bus lines when view mode changes
    useEffect(() => {
        if (selectedLine) {
            fetchBusLine(selectedLine);
        }
    }, [selectedLine, viewMode]);

    // Filter lines based on search query
    const filteredLines = lines.filter((line) => {
        const searchLower = searchQuery.toLowerCase();
        const lineName = line.name.toLowerCase();

        // If searching for a number, match it exactly
        if (/^\d+$/.test(searchQuery)) {
            return lineName.includes(`line ${searchQuery}`) ||
                lineName.includes(`line${searchQuery}`);
        }

        return lineName.includes(searchLower);
    });

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
        handleSelectStop,
        path,
        error,
        handleFindPath,
        handleInputFocus,
        handleMapClick,
        startCoordinates,
        endCoordinates,
        viewMode,
        setViewMode,
        setError,
    };
};

export default useBusLinesViewModel;
