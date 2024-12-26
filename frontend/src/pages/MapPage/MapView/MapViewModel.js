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
        if (mapRef.current && stops.length) {
            stops.forEach((stop) => {
                new mapboxgl.Marker({color: "blue"})
                    .setLngLat([stop.pointX, stop.pointY])
                    .setPopup(new mapboxgl.Popup().setHTML(`<p>${stop.name}</p>`))
                    .addTo(mapRef.current);
            });
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
            ["path-driving", "path-walking", "path-bus"].forEach((layerId) => {
                if (map.getLayer(layerId)) {
                    map.removeLayer(layerId);
                    map.removeSource(layerId);
                }
            });

            // Helper to fetch and draw routes
            const fetchAndDrawRoute = (waypoints, layerId, lineColor, profile) => {
                return fetch(`https://api.mapbox.com/directions/v5/mapbox/${profile}/${waypoints}?geometries=geojson&access_token=${mapboxgl.accessToken}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.routes && data.routes.length > 0) {
                            const route = data.routes[0].geometry;

                            if (map.getSource(layerId)) {
                                map.getSource(layerId).setData({
                                    type: "Feature",
                                    geometry: route,
                                });
                            } else {
                                map.addSource(layerId, {
                                    type: "geojson",
                                    data: {
                                        type: "Feature",
                                        geometry: route,
                                    },
                                });

                                map.addLayer({
                                    id: layerId,
                                    type: "line",
                                    source: layerId,
                                    layout: {
                                        "line-join": "round",
                                        "line-cap": "round",
                                    },
                                    paint: {
                                        "line-color": lineColor,
                                        "line-width": 4,
                                    },
                                });
                            }

                            return route.coordinates;
                        }
                        return [];
                    })
                    .catch(err => {
                        console.error(`Error fetching route for ${layerId}:`, err);
                        return [];
                    });
            };

            // Process and fetch routes for each type
            const fetchRoutes = async () => {
                const allCoordinates = [];

                // Driving route
                const drivingPaths = path.filter(p => p.type === "driving");
                for (const [index, drivingPath] of drivingPaths.entries()) {
                    if (drivingPath.coords.length > 0) {
                        const waypoints = drivingPath.coords
                            .map(([latitude, longitude]) => `${longitude},${latitude}`)
                            .join(";");

                        const coords = await fetchAndDrawRoute(waypoints, `path-driving-${index}`, "#FF0000", "driving");
                        allCoordinates.push(...coords);
                    }
                }

                // Walking route
                const walkingPaths = path.filter(p => p.type === "walking");
                for (const [index, walkingPath] of walkingPaths.entries()) {
                    if (walkingPath.coords.length > 0) {
                        const waypoints = walkingPath.coords
                            .map(([latitude, longitude]) => `${longitude},${latitude}`)
                            .join(";");

                        const coords = await fetchAndDrawRoute(waypoints, `path-walking-${index}`, "#00FF00", "walking");
                        allCoordinates.push(...coords);
                    }
                }

                // Bus route
                const busPaths = path.filter(p => p.type === "bus");
                for (const [index, busPath] of busPaths.entries()) {
                    if (busPath.coords.length > 0) {
                        const waypoints = busPath.coords
                            .map(([latitude, longitude]) => `${longitude},${latitude}`)
                            .join(";");

                        const coords = await fetchAndDrawRoute(waypoints, `path-bus-${index}`, "#007cbf", "driving");
                        allCoordinates.push(...coords);
                    }
                }

                // Fit bounds after all routes are fetched
                if (allCoordinates.length > 0) {
                    try {
                        const bounds = allCoordinates.reduce((bounds, coords) => {
                            return bounds.extend(coords);
                        }, new mapboxgl.LngLatBounds(allCoordinates[0], allCoordinates[0]));

                        map.fitBounds(bounds, { padding: 20 });
                    } catch (e) {
                        console.error("Error fitting bounds:", e);
                    }
                }
            };

            fetchRoutes();
        }
    }, [path]);



    return {
        mapContainerRef,
        error,
    };
};

export default useMapViewModel;