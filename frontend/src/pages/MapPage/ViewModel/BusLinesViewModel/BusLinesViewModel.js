import { useState, useCallback } from "react";

const useBusLinesViewModel = () => {
    const [lines, setLines] = useState([]);

    const fetchLines = useCallback(() => {
        const mockData = [
            { id: 1, name: 'Line N', start: 'Stop A', end: 'Stop B', time: '8:00 AM - 10:00 AM' },
            { id: 2, name: 'Line X', start: 'Stop C', end: 'Stop D', time: '9:00 AM - 11:00 AM' },
        ];
        setLines(mockData);
    }, []);

    return {
        lines,
        fetchLines,
    };
};

export default useBusLinesViewModel;


// const fetchLines = useCallback(async () => {
//     try {
//         const response = await fetch("/api/bus-lines");
//         const data = await response.json();
//         setLines(data);
//     } catch (error) {
//         console.error("Failed to fetch bus lines:", error);
//     }
// }, []);
