import { useEffect, useRef, useState } from "react";
import mapDisplayService from "@/services/MapDisplayService.js";

/**
 * Custom hook for MapView component
 * Refactored to use Facade pattern with MapDisplayService
 *
 * @param {Object} props - Component properties
 * @returns {Object} - Map container reference and error state
 */
const useMapViewModel = ({
                             mapData,
                             busLines,
                             stops,
                             selectedStopCoordinates,
                             mode,
                             path,
                             onMapClick
                         }) => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const [error, setError] = useState(null);

    // Initialize map on component mount
    useEffect(() => {
        try {
            // Initialize map using MapDisplayService
            mapRef.current = mapDisplayService.initializeMap(mapContainerRef.current, {
                center: [106.70098, 10.77584], // Ho Chi Minh City
                zoom: 13,
                maxZoom: 17,
                minZoom: 9
            });

            // Set up click handler for location selection
            mapDisplayService.setLocationClickHandler(mapRef.current, onMapClick);

            return () => {
                // Clean up resources when component unmounts
                if (mapRef.current) {
                    mapDisplayService.cleanup(mapRef.current);
                    mapRef.current.remove();
                }
            };
        } catch (err) {
            console.error("Error initializing map:", err);
            setError("Failed to initialize map");
        }
    }, []);

    // Handle bus stops display
    useEffect(() => {
        if (mapRef.current && stops && stops.length > 0) {
            const map = mapRef.current;

            try {
                // Get stops that are part of the current navigation path
                const stopsInPath = mapDisplayService.getStopsInPath(path);

                // Display bus stops with highlighted stops in path
                mapDisplayService.displayBusStops(map, stops, {
                    highlightStops: stopsInPath
                });
            } catch (err) {
                console.error("Error displaying bus stops:", err);
            }
        }
    }, [stops, path]);

    // Focus map on selected stop
    useEffect(() => {
        if (mapRef.current && selectedStopCoordinates) {
            try {
                mapDisplayService.focusOnLocation(mapRef.current, selectedStopCoordinates, {
                    zoom: 15,
                    essential: true
                });
            } catch (err) {
                console.error("Error focusing on location:", err);
            }
        }
    }, [selectedStopCoordinates]);

    // Handle bus route drawing
    useEffect(() => {
        if (mapRef.current && busLines && busLines.length > 0) {
            try {
                const line = busLines[0];

                // Display bus route with correct direction
                mapDisplayService.displayRoute(mapRef.current, {
                    id: line.id,
                    coordinates: line.route.coordinates,
                    mode: mode
                }, {
                    showArrows: true
                });
            } catch (err) {
                console.error("Error drawing bus route:", err);
            }
        }
    }, [busLines, mode]);

    // Handle navigation path display
    useEffect(() => {
        if (mapRef.current && Array.isArray(path) && path.length > 0) {
            try {
                // Display navigation path segments
                mapDisplayService.displayNavigationPath(mapRef.current, path);
            } catch (err) {
                console.error("Error displaying navigation path:", err);
                setError("Failed to display navigation path");
            }
        }
    }, [path]);

    return {
        mapContainerRef,
        error
    };
};

export default useMapViewModel;