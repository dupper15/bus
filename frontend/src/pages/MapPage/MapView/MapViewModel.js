import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = "pk.eyJ1IjoibGR2MTIiLCJhIjoiY200eTRtdmRtMHJiOTJrcTc1dW15cG5teiJ9.MMYAJ5OuU2cXhgydFpRXHg";

const useMapViewModel = ({ mapData, busLines, stops, selectedStopCoordinates, mode, path, onMapClick }) => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const [error] = useState(null);

    // Helper function to clear all route layers and sources
    const clearRouteLayers = (map) => {
        if (!map || !map.isStyleLoaded()) return;

        try {
            // Get all layers and sources
            const layers = map.getStyle().layers;

            // Remove path layers and sources
            layers?.forEach((layer) => {
                if (layer.id.startsWith("path-") || layer.id.startsWith("line-")) {
                    if (map.getLayer(layer.id)) {
                        map.removeLayer(layer.id);
                    }
                    // Only remove source after its layer is removed
                    if (map.getSource(layer.id)) {
                        map.removeSource(layer.id);
                    }
                }
            });
        } catch (error) {
            console.error("Error clearing route layers:", error);
        }
    };

    // Function to handle drawing routes
    const handleRouteDrawing = (map) => {
        if (!map.isStyleLoaded()) {
            // If style isn't loaded, wait for it
            map.once('style.load', () => handleRouteDrawing(map));
            return;
        }

        // Clear existing route layers first
        clearRouteLayers(map);

        // Only add new lines if there are busLines and they're not empty
        if (busLines && busLines.length > 0) {
            const line = busLines[0];
            const routeCoordinates = mode === "inbound" ? [...line.route.coordinates].reverse() : line.route.coordinates;

            if (routeCoordinates) {
                try {
                    map.addSource(`line-${line.id}`, {
                        type: "geojson",
                        data: {
                            type: "Feature",
                            geometry: {
                                type: "LineString",
                                coordinates: routeCoordinates,
                            },
                        },
                    });

                    map.addLayer({
                        id: `line-${line.id}`,
                        type: "line",
                        source: `line-${line.id}`,
                        layout: {
                            "line-join": "round",
                            "line-cap": "round",
                        },
                        paint: {
                            "line-color": "#FF5733",
                            "line-width": 4,
                        },
                    });
                } catch (error) {
                    console.error("Error adding route layer:", error);
                }
            }
        }
    };

    useEffect(() => {
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/mapbox/streets-v11",
            center: [106.70098, 10.77584],
            zoom: 13,
            maxZoom: 17,
            minZoom: 9
        });

        mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

        mapRef.current.on("click", (e) => {
            const coordinates = [e.lngLat.lng, e.lngLat.lat];
            onMapClick(coordinates);
        });

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
            }
        };
    }, []);

    // Effect for handling bus lines
    useEffect(() => {
        if (mapRef.current) {
            handleRouteDrawing(mapRef.current);
        }
    }, [busLines, mode]);

    // Effect for handling navigation path
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const handlePathUpdate = () => {
            if (!map.isStyleLoaded()) {
                map.once('style.load', handlePathUpdate);
                return;
            }

            // Clear existing path layers
            clearRouteLayers(map);

            // Only proceed with drawing if there's a path
            if (Array.isArray(path) && path.length > 0) {
                const processSegments = async () => {
                    const allCoordinates = [];

                    for (let i = 0; i < path.length; i++) {
                        const { type, coords, to } = path[i];
                        let waypoints = '';
                        let color = '#FF0000';

                        if (type === 'walking') {
                            color = '#00FF00';
                        } else if (type === 'bus') {
                            color = '#007cbf';
                        }

                        if (type === 'bus' && to) {
                            waypoints = to
                                .map(stop => `${stop.pointX},${stop.pointY}`)
                                .join(';');
                        } else if (coords && coords.length >= 2) {
                            waypoints = coords
                                .map(coord => Array.isArray(coord)
                                    ? `${coord[1]},${coord[0]}`
                                    : `${coord.longitude},${coord.latitude}`)
                                .join(';');
                        }

                        if (waypoints) {
                            const profile = type === 'walking' ? 'walking' : 'driving';
                            const sourceId = `path-${type}-${i}`;

                            try {
                                const response = await fetch(
                                    `https://api.mapbox.com/directions/v5/mapbox/${profile}/${waypoints}?geometries=geojson&access_token=${mapboxgl.accessToken}`
                                );
                                const data = await response.json();

                                if (data.routes && data.routes.length > 0) {
                                    const route = data.routes[0].geometry;
                                    allCoordinates.push(...route.coordinates);

                                    if (map.getSource(sourceId)) {
                                        map.removeSource(sourceId);
                                    }

                                    map.addSource(sourceId, {
                                        type: "geojson",
                                        data: {
                                            type: "Feature",
                                            geometry: route
                                        }
                                    });

                                    map.addLayer({
                                        id: sourceId,
                                        type: "line",
                                        source: sourceId,
                                        layout: {
                                            "line-join": "round",
                                            "line-cap": "round"
                                        },
                                        paint: {
                                            "line-color": color,
                                            "line-width": 4
                                        }
                                    });
                                }
                            } catch (error) {
                                console.error(`Error fetching route for ${type} segment ${i}:`, error);
                            }
                        }
                    }

                    if (allCoordinates.length > 0) {
                        try {
                            const bounds = allCoordinates.reduce(
                                (bounds, coord) => bounds.extend(coord),
                                new mapboxgl.LngLatBounds(allCoordinates[0], allCoordinates[0])
                            );
                            map.fitBounds(bounds, { padding: 50 });
                        } catch (error) {
                            console.error("Error fitting bounds:", error);
                        }
                    }
                };

                processSegments();
            }
        };

        handlePathUpdate();
    }, [path]);

    return {
        mapContainerRef,
        error,
    };
};

export default useMapViewModel;