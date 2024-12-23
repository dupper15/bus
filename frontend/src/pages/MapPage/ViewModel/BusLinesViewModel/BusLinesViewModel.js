// frontend/src/pages/MapPage/ViewModel/BusLinesViewModel/BusLinesViewModel.js
import { useState, useCallback } from "react";
import LineService from "@/services/LineService";
import StopService from "@/services/StopService";

import {fetchBusLineRoute} from "@/services/MapboxService.js";
import {transformLine, transformStop} from "@/utils/Transformer.js";


const useBusLinesViewModel = () => {
    const [stops, setStops] = useState([]);
    const [lines, setLines] = useState([]);
    const [busLines, setBusLines] = useState([]);

    const fetchLines = useCallback(async () => {
        try {
            const response = await LineService.getLines();
            const rawLines = response.data;
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
            const route = await fetchBusLineRoute(stops);
            console.log("Route:", route);
            setBusLines((prevLines) => [...prevLines, { ...line, route }]);
        } catch (error) {
            console.error(error.message);
        }
    };

    return {
        lines,
        fetchLines,
        stops,
        fetchStops,
        busLines,
        fetchBusLine,
    };
};

export default useBusLinesViewModel;