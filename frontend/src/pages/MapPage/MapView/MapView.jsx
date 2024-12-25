import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { stopPropTypes, linePropTypes } from "@/utils/PropTypes.js";

mapboxgl.accessToken = "pk.eyJ1IjoibGR2MTIiLCJhIjoiY200eTRtdmRtMHJiOTJrcTc1dW15cG5teiJ9.MMYAJ5OuU2cXhgydFpRXHg";

const MapView = ({ mapData, busLines, stops, selectedStopCoordinates, mode, path, error, onMapClick }) => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);

    useEffect(() => {
        // Initialize the map
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/mapbox/streets-v11",
            center: [106.70098, 10.77584],
            zoom: 13,
            maxZoom: 15,
            minZoom: 9
        });

        // Add navigation controls
        mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

        // Add click event listener
        mapRef.current.on("click", (e) => {
            const coordinates = [e.lngLat.lng, e.lngLat.lat];
            onMapClick(coordinates);
        });

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
            }
        };
    }, [onMapClick]);

    useEffect(() => {
        // Add markers for mapData (general stops)
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
                // Remove previous line layers
                const layers = map.getStyle().layers;
                if (layers) {
                    layers.forEach((layer) => {
                        if (layer.id.startsWith("line-")) {
                            map.removeLayer(layer.id);
                            map.removeSource(layer.id);
                        }
                    });
                }

                // Add the selected bus line route based on mode
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
        // Add markers for selected stops
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
        // Zoom in on the selected stop
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

            // Remove any existing path
            if (map.getLayer("path")) {
                map.removeLayer("path");
                map.removeSource("path");
            }

            // Add new path
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

    return (
        <>
            <div
                ref={mapContainerRef}
                style={{
                    width: "100%",
                    height: "100%",
                }}
            />
            {error && (
                <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-center py-2">
                    {error}
                </div>
            )}
        </>
    );
};

MapView.propTypes = {
    mapData: PropTypes.arrayOf(stopPropTypes),
    busLines: PropTypes.arrayOf(linePropTypes),
    stops: PropTypes.arrayOf(stopPropTypes),
    selectedStopCoordinates: PropTypes.arrayOf(PropTypes.number),
    mode: PropTypes.oneOf(["outbound", "inbound"]).isRequired,
    path: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
    error: PropTypes.string,
    onMapClick: PropTypes.func.isRequired,
};

export default MapView;