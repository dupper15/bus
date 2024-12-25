import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = "pk.eyJ1IjoibGR2MTIiLCJhIjoiY200eTRtdmRtMHJiOTJrcTc1dW15cG5teiJ9.MMYAJ5OuU2cXhgydFpRXHg";

const useMapViewModel = ({ mapData, busLines, stops, selectedStopCoordinates, mode, path, onMapClick }) => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const [error, setError] = useState(null);

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
                new mapboxgl.Marker({ color: "blue" })
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
        if (mapRef.current) {
            const map = mapRef.current;

            if (map.getLayer("path")) {
                map.removeLayer("path");
                map.removeSource("path");
            }

            if (path.length > 0) {
                map.addSource("path", {
                    type: "geojson",
                    data: {
                        type: "Feature",
                        geometry: {
                            type: "LineString",
                            coordinates: path,
                        },
                    },
                });

                map.addLayer({
                    id: "path",
                    type: "line",
                    source: "path",
                    layout: {
                        "line-join": "round",
                        "line-cap": "round",
                    },
                    paint: {
                        "line-color": "#007cbf",
                        "line-width": 4,
                    },
                });
            }
        }
    }, [path]);

    return {
        mapContainerRef,
        error,
    };
};

export default useMapViewModel;