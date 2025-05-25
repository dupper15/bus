import { useEffect, useRef, useState } from "react";
import mapDisplayService from "@/services/MapDisplayService.js";

/**
 * MapViewModel - Enhanced to handle Strategy pattern route structures
 * Handles map state and delegates all MapBox operations to the service layer
 */
const useMapViewModel = ({ busLines, stops, selectedStopCoordinates, mode, path, onMapClick }) => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const [error] = useState(null);

    // Initialize map
    useEffect(() => {
        if (!mapContainerRef.current) return;

        mapRef.current = mapDisplayService.initializeMap(mapContainerRef.current);

        // Set up click handler for location selection
        mapDisplayService.setLocationClickHandler(mapRef.current, onMapClick);

        return () => {
            if (mapRef.current) {
                mapDisplayService.cleanup(mapRef.current);
                mapRef.current.remove();
            }
        };
    }, [onMapClick]);

    // Handle bus stops display
    useEffect(() => {
        if (!mapRef.current || !stops || stops.length === 0) return;

        const stopsInPath = mapDisplayService.getStopsInPath(path);

        mapDisplayService.displayBusStops(mapRef.current, stops, {
            highlightStops: stopsInPath
        });

        return () => {
            mapDisplayService.clearStopMarkers();
        };
    }, [stops, path]);

    // Handle selected stop focus
    useEffect(() => {
        if (mapRef.current && selectedStopCoordinates) {
            mapDisplayService.focusOnLocation(mapRef.current, selectedStopCoordinates, {
                zoom: 15
            });
        }
    }, [selectedStopCoordinates]);

    // Handle bus line route display
    useEffect(() => {
        if (!mapRef.current || !busLines || busLines.length === 0) return;

        const line = busLines[0];
        if (line && line.route) {
            mapDisplayService.displayRoute(mapRef.current, {
                id: line.id,
                coordinates: line.route.coordinates,
                mode: mode
            }, {
                showArrows: true
            });
        }
    }, [busLines, mode]);

    // Handle navigation path display - Now expects pre-transformed path
    useEffect(() => {
        if (!mapRef.current || !Array.isArray(path) || path.length === 0) return;

        console.log('MapViewModel received path:', path); // Debug log

        // Path should already be transformed by PathTransformerService
        if (path.length > 0 && path[0].coords) {
            mapDisplayService.displayNavigationPath(mapRef.current, path);
        } else {
            console.warn('MapViewModel received path without coords property:', path);
        }
    }, [path]);

    return {
        mapContainerRef,
        error,
    };
};

export default useMapViewModel;