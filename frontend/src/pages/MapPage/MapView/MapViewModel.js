import {useState, useEffect, useRef} from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = "pk.eyJ1IjoibGR2MTIiLCJhIjoiY200eTRtdmRtMHJiOTJrcTc1dW15cG5teiJ9.MMYAJ5OuU2cXhgydFpRXHg";

const useMapViewModel = ({mapData, busLines, stops, selectedStopCoordinates, mode, path, onMapClick}) => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const [error] = useState(null);

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

    useEffect(() => {
        if (mapRef.current && mapData) {
            mapData.forEach((location) => {
                new mapboxgl.Marker()
                    .setLngLat([location.pointX, location.pointY])
                    .setPopup(new mapboxgl.Popup().setHTML(`<p>${location.name}</p>`))
                    .addTo(mapRef.current);
            });
        }
    }, [mapData]);

    useEffect(() => {
        if (mapRef.current) {
            const map = mapRef.current;

            const handleStyleData = () => {
                const layers = map.getStyle().layers;
                if (layers) {
                    layers.forEach((layer) => {
                        if (layer.id.startsWith("line-")) {
                            map.removeLayer(layer.id);
                            map.removeSource(layer.id);
                        }
                    });
                }

                if (busLines.length > 0) {
                    const line = busLines[0];
                    const routeCoordinates = mode === "inbound" ? [...line.route.coordinates].reverse() : line.route.coordinates;

                    if (routeCoordinates) {
                        if (!map.getSource(`line-${line.id}`)) {
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
                        }
                    }
                }
            };

            if (map.isStyleLoaded()) {
                handleStyleData();
            } else {
                map.on('styledata', handleStyleData);
            }

            return () => {
                map.off('styledata', handleStyleData);
            };
        }
    }, [busLines, mode]);

    useEffect(() => {
        if (mapRef.current) {
            const map = mapRef.current;
            let stopMarkers = [];

            // Function to update visible stops based on zoom level
            const updateMarkersVisibility = () => {
                const currentZoom = Math.floor(map.getZoom()); // Use whole zoom levels for simplicity

                // Calculate how many stops to display for the current zoom level
                const maxZoom = 14; // Maximum zoom level where all stops are visible
                const minZoom = 10; // Minimum zoom level where no stops are visible
                const stopsToShow = Math.max(0, stops.length * (currentZoom - minZoom) / (maxZoom - minZoom));

                stopMarkers.forEach((marker, index) => {
                    if (index < stopsToShow) {
                        marker.getElement().style.display = "block";
                    } else {
                        marker.getElement().style.display = "none";
                    }
                });
            };

            // Add all stops as markers initially
            stopMarkers = stops.map((stop) => {
                const marker = new mapboxgl.Marker({ color: "blue" })
                    .setLngLat([stop.pointX, stop.pointY])
                    .setPopup(new mapboxgl.Popup().setHTML(`<p>${stop.name}</p>`))
                    .addTo(map);
                return marker;
            });

            // Update visibility whenever the zoom level changes
            map.on("zoom", updateMarkersVisibility);

            // Initial visibility update
            updateMarkersVisibility();

            return () => {
                // Cleanup markers and event listeners
                stopMarkers.forEach((marker) => marker.remove());
                map.off("zoom", updateMarkersVisibility);
            };
        }
    }, [stops]);


    useEffect(() => {
        if (mapRef.current && selectedStopCoordinates) {
            mapRef.current.flyTo({
                center: selectedStopCoordinates,
                zoom: 15,
                essential: true,
            });
        }
    }, [selectedStopCoordinates]);

    useEffect(() => {
        if (mapRef.current && Array.isArray(path) && path.length > 0) {
            const map = mapRef.current;

            // Remove existing layers and sources
            const existingLayers = map.getStyle().layers;
            existingLayers?.forEach((layer) => {
                if (layer.id.startsWith("path-")) {
                    map.removeLayer(layer.id);
                    map.removeSource(layer.id);
                }
            });

            // Helper to fetch and draw routes
            const fetchAndDrawRoute = async (segment, index) => {
                const { type, coords } = segment;
                let waypoints = '';
                let color = '#FF0000'; // Default color for driving

                if (type === 'walking') {
                    color = '#00FF00';
                } else if (type === 'bus') {
                    color = '#007cbf';
                }

                // Handle bus segments with intermediate stops
                if (type === 'bus' && segment.to) {
                    // Use all intermediate stops for the route
                    waypoints = segment.to
                        .map(stop => `${stop.pointX},${stop.pointY}`)
                        .join(';');
                }
                // Handle walking segments
                else if (coords && coords.length >= 2) {
                    waypoints = coords
                        .map(coord => Array.isArray(coord)
                            ? `${coord[1]},${coord[0]}`
                            : `${coord.longitude},${coord.latitude}`)
                        .join(';');
                }

                if (waypoints) {
                    const profile = type === 'walking' ? 'walking' : 'driving';
                    const sourceId = `path-${type}-${index}`;

                    try {
                        const response = await fetch(
                            `https://api.mapbox.com/directions/v5/mapbox/${profile}/${waypoints}?geometries=geojson&access_token=${mapboxgl.accessToken}`
                        );
                        const data = await response.json();

                        if (data.routes && data.routes.length > 0) {
                            const route = data.routes[0].geometry;

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

                            return route.coordinates;
                        }
                    } catch (error) {
                        console.error(`Error fetching route for ${type} segment ${index}:`, error);
                    }
                }
                return [];
            };

            // Process each segment
            const processSegments = async () => {
                const allCoordinates = [];

                for (let i = 0; i < path.length; i++) {
                    const coords = await fetchAndDrawRoute(path[i], i);
                    allCoordinates.push(...coords);
                }

                // Fit bounds to show all segments
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
    }, [path]);

    return {
        mapContainerRef,
        error,
    };
};

export default useMapViewModel;