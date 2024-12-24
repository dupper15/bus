import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { stopPropTypes, linePropTypes } from "@/utils/PropTypes.js";

mapboxgl.accessToken = "pk.eyJ1IjoibGR2MTIiLCJhIjoiY200eTRtdmRtMHJiOTJrcTc1dW15cG5teiJ9.MMYAJ5OuU2cXhgydFpRXHg";

const MapView = ({ mapData, busLines, stops, selectedStopCoordinates, mode }) => {
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

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
            }
        };
    }, []);

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

    return (
        <div
            ref={mapContainerRef}
            style={{
                width: "100%",
                height: "100%",
            }}
        />
    );
};

MapView.propTypes = {
    mapData: PropTypes.arrayOf(stopPropTypes),
    busLines: PropTypes.arrayOf(linePropTypes),
    stops: PropTypes.arrayOf(stopPropTypes),
    selectedStopCoordinates: PropTypes.arrayOf(PropTypes.number),
    mode: PropTypes.oneOf(["outbound", "inbound"]).isRequired,
};

export default MapView;