import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = "pk.eyJ1IjoibGR2MTIiLCJhIjoiY200eTRtdmRtMHJiOTJrcTc1dW15cG5teiJ9.MMYAJ5OuU2cXhgydFpRXHg";

const MapView = ({ mapData, busLines, stops }) => {
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
        // Add bus line routes
        if (mapRef.current && busLines.length) {
            busLines.forEach((line) => {
                if (!mapRef.current.getSource(`line-${line.id}`)) {
                    mapRef.current.addSource(`line-${line.id}`, {
                        type: "geojson",
                        data: {
                            type: "Feature",
                            geometry: line.route,
                        },
                    });

                    mapRef.current.addLayer({
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
            });
        }
    }, [busLines]);

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
    mapData: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            pointY: PropTypes.number.isRequired,
            pointX: PropTypes.number.isRequired,
        })
    ),
    busLines: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            start_place: PropTypes.shape({
                id: PropTypes.string.isRequired,
                name: PropTypes.string.isRequired,
                address: PropTypes.string.isRequired,
                pointX: PropTypes.number.isRequired,
                pointY: PropTypes.number.isRequired,
                isStation: PropTypes.bool.isRequired,
            }).isRequired,
            end_place: PropTypes.shape({
                id: PropTypes.string.isRequired,
                name: PropTypes.string.isRequired,
                address: PropTypes.string.isRequired,
                pointX: PropTypes.number.isRequired,
                pointY: PropTypes.number.isRequired,
                isStation: PropTypes.bool.isRequired,
            }).isRequired,
            time: PropTypes.number.isRequired,
            arr_stop: PropTypes.arrayOf(
                PropTypes.shape({
                    id: PropTypes.string.isRequired,
                    name: PropTypes.string.isRequired,
                    address: PropTypes.string.isRequired,
                    pointX: PropTypes.number.isRequired,
                    pointY: PropTypes.number.isRequired,
                    isStation: PropTypes.bool.isRequired,
                })
            ).isRequired,
        })
    ),
    stops: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            address: PropTypes.string.isRequired,
            pointY: PropTypes.number.isRequired,
            pointX: PropTypes.number.isRequired,
            isStation: PropTypes.bool.isRequired,
        })
    ),
};

export default MapView;
