import { useEffect, useRef, useState, useCallback } from "react";
import mapDisplayService from "@/services/MapDisplayService.js";

/**
 * Enhanced MapViewModel hook with support for custom click handlers
 */
const useMapViewModel = ({
                             mapData,
                             busLines,
                             stops,
                             selectedStopCoordinates,
                             mode,
                             path,
                             onMapClick,
                             clickHandler, // Custom click handler from NavigationTab
                             mapRef // Reference to expose map instance
                         }) => {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const [error, setError] = useState(null);

    // Initialize map on component mount
    useEffect(() => {
        try {
            // Initialize map using MapDisplayService
            mapInstanceRef.current = mapDisplayService.initializeMap(mapContainerRef.current, {
                center: [106.70098, 10.77584], // Ho Chi Minh City
                zoom: 13,
                maxZoom: 17,
                minZoom: 9
            });

            // Expose map instance to parent via ref
            if (mapRef) {
                mapRef.current = mapInstanceRef.current;
            }

            return () => {
                // Clean up resources when component unmounts
                if (mapInstanceRef.current) {
                    mapDisplayService.cleanup(mapInstanceRef.current);
                    mapInstanceRef.current.remove();
                }
                if (mapRef) {
                    mapRef.current = null;
                }
            };
        } catch (err) {
            console.error("Error initializing map:", err);
            setError("Failed to initialize map");
        }
    }, []);

    // Stable callback for default map clicks
    const handleDefaultMapClick = useCallback((coordinates) => {
        console.log('Default map click:', coordinates);
        if (onMapClick && Array.isArray(coordinates) && coordinates.length >= 2) {
            onMapClick(coordinates);
        }
    }, [onMapClick]);

    // Stable callback for custom map clicks
    const handleCustomMapClick = useCallback((coordinates) => {
        console.log('Custom map click:', coordinates);
        if (clickHandler && Array.isArray(coordinates) && coordinates.length >= 2) {
            clickHandler(coordinates);
        } else {
            console.error('Invalid coordinates or no click handler:', { coordinates, hasHandler: !!clickHandler });
        }
    }, [clickHandler]);

    // Handle click handler setup
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        console.log('Setting up click handler:', clickHandler ? 'custom' : 'default');

        // Use custom handler if provided, otherwise use default
        const activeHandler = clickHandler ? handleCustomMapClick : handleDefaultMapClick;

        mapDisplayService.setLocationClickHandler(mapInstanceRef.current, activeHandler);

        // Cleanup function
        return () => {
            if (mapInstanceRef.current) {
                mapDisplayService.clearAllClickHandlers(mapInstanceRef.current);
            }
        };
    }, [clickHandler, handleCustomMapClick, handleDefaultMapClick]);

    // Handle bus stops display
    useEffect(() => {
        if (mapInstanceRef.current && stops && stops.length > 0) {
            try {
                // Get stops that are part of the current navigation path
                const stopsInPath = mapDisplayService.getStopsInPath(path);

                // Display bus stops with highlighted stops in path
                mapDisplayService.displayBusStops(mapInstanceRef.current, stops, {
                    highlightStops: stopsInPath
                });
            } catch (err) {
                console.error("Error displaying bus stops:", err);
            }
        }
    }, [stops, path]);

    // Focus map on selected stop
    useEffect(() => {
        if (mapInstanceRef.current && selectedStopCoordinates) {
            try {
                mapDisplayService.focusOnLocation(mapInstanceRef.current, selectedStopCoordinates, {
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
        if (mapInstanceRef.current && busLines && busLines.length > 0) {
            try {
                const line = busLines[0];

                // Display bus route with correct direction
                mapDisplayService.displayRoute(mapInstanceRef.current, {
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
        if (mapInstanceRef.current && Array.isArray(path) && path.length > 0) {
            try {
                console.log('Displaying navigation path:', path);
                // Display navigation path segments
                mapDisplayService.displayNavigationPath(mapInstanceRef.current, path);
            } catch (err) {
                console.error("Error displaying navigation path:", err);
                setError("Failed to display navigation path");
            }
        }
    }, [path]);

    return {
        mapContainerRef,
        error,
        mapInstance: mapInstanceRef.current // Expose map instance
    };
};

export default useMapViewModel;