import { useState, useCallback, useEffect } from "react";
import GeoapifyService from "@/services/GeoapifyService";

const useNavigationViewModel = () => {
    const [path, setPath] = useState([]);
    const [error, setError] = useState(null);
    const [start, setStart] = useState({ name: "", coordinates: [] });
    const [end, setEnd] = useState({ name: "", coordinates: [] });
    const [startSuggestions, setStartSuggestions] = useState([]);
    const [endSuggestions, setEndSuggestions] = useState([]);

    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func(...args);
            }, delay);
        };
    };

    const fetchSuggestions = async (query, setSuggestions) => {
        if (!query) return;
        const bbox = [106.491, 10.348, 107.020, 11.160]; // Ho Chi Minh City bounding box
        const suggestions = await GeoapifyService.fetchSuggestions(query, bbox);
        setSuggestions(suggestions);
    };

    const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 300), []);

    const handleChange = (value, setField, setSuggestions) => {
        setField((prev) => ({ ...prev, name: value }));
        debouncedFetchSuggestions(value, setSuggestions);
    };

    const handleSuggestionClick = (suggestion, setField, setSuggestions) => {
        setField(suggestion);
        setSuggestions([]);
    };

    const findNearestBusStop = (coords, busStops) => {
        let nearestStop = null;
        let minDistance = Infinity;

        busStops.forEach((stop) => {
            const distance = Math.sqrt(
                Math.pow(stop.pointX - coords[0], 2) + Math.pow(stop.pointY - coords[1], 2)
            );
            if (distance < minDistance) {
                minDistance = distance;
                nearestStop = stop;
            }
        });

        return nearestStop;
    };

    const findPath = async (startCoords, endCoords, busStops) => {
        try {
            const startStop = findNearestBusStop(startCoords, busStops);
            const endStop = findNearestBusStop(endCoords, busStops);

            if (!startStop || !endStop) {
                setPath([]);
                setError("No nearby stops found.");
                return;
            }

            // Placeholder logic for setting path
            setPath([startStop, endStop]);
            setError(null);
        } catch (err) {
            setPath([]);
            setError(err);
        }
    };

    const handleSwap = () => {
        const temp = start;
        setStart(end);
        setEnd(temp);
    };

    return {
        path,
        error,
        start,
        end,
        startSuggestions,
        endSuggestions,
        findPath,
        handleStartChange: (value) => handleChange(value, setStart, setStartSuggestions),
        handleEndChange: (value) => handleChange(value, setEnd, setEndSuggestions),
        handleStartSuggestionClick: (suggestion) => handleSuggestionClick(suggestion, setStart, setStartSuggestions),
        handleEndSuggestionClick: (suggestion) => handleSuggestionClick(suggestion, setEnd, setEndSuggestions),
        handleSwap,
    };
};

export default useNavigationViewModel;