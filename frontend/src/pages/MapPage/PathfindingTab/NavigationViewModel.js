import { useState } from "react";
import MapBoxService from "@/services/MapboxService";

const useNavigationViewModel = () => {
    const [path, setPath] = useState([]);
    const [error, setError] = useState(null);
    const [start, setStart] = useState({ name: "", coordinates: [] });
    const [end, setEnd] = useState({ name: "", coordinates: [] });
    const [startSuggestions, setStartSuggestions] = useState([]);
    const [endSuggestions, setEndSuggestions] = useState([]);

    const findNearestBusStop = async (coords, busStops) => {
        let nearestStop = null;
        let minDistance = Infinity;

        busStops.forEach(stop => {
            const distance = Math.sqrt(
                Math.pow(stop.pointX - coords[0], 2) + Math.pow(stop.pointY - coords[1], 2)
            );
            console.log(stop.name, distance);
            if (distance < minDistance) {
                minDistance = distance;
                nearestStop = stop;
            }
        });

        return nearestStop;
    };

    const findPath = async (startCoords, endCoords, busStops) => {
        try {
            const startStop = await findNearestBusStop(startCoords, busStops);
            const endStop = await findNearestBusStop(endCoords, busStops);
            console.log(startStop, endStop);

            if (!startStop || !endStop) {
                setPath([]);
                setError("No nearby stops found.");
                return;
            }

            const newPath = await MapBoxService.fetchPath(startStop, endStop);
            setPath(newPath);
            setError(null);
        } catch (err) {
            setPath([]);
            setError("Error fetching route.");
            console.error(err);
        }
    };

    const handleStartChange = async (value) => {
        setStart((prevStart) => ({ ...prevStart, name: value }));
        const bbox = [106.491, 10.348, 107.020, 11.160]; // Bounding box for Ho Chi Minh City
        const suggestions = await MapBoxService.fetchSuggestions(value, bbox);
        setStartSuggestions(suggestions);
    };

    const handleEndChange = async (value) => {
        setEnd((prevEnd) => ({ ...prevEnd, name: value }));
        const bbox = [106.491, 10.348, 107.020, 11.160]; // Bounding box for Ho Chi Minh City
        const suggestions = await MapBoxService.fetchSuggestions(value, bbox);
        setEndSuggestions(suggestions);
    };

    const handleStartSuggestionClick = (suggestion) => {
        setStart(suggestion);
        setStartSuggestions([]);
    };

    const handleEndSuggestionClick = (suggestion) => {
        setEnd(suggestion);
        setEndSuggestions([]);
    };

    const handleSwap = () => {
        const temp = start;
        setStart(end);
        setEnd(temp);
    };

    return {
        path,
        error,
        findPath,
        start,
        end,
        startSuggestions,
        endSuggestions,
        handleStartChange,
        handleEndChange,
        handleStartSuggestionClick,
        handleEndSuggestionClick,
        handleSwap,
        setStart,
        setEnd,
    };
};

export default useNavigationViewModel;