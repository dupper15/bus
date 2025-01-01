import {useEffect, useRef, useState} from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = "pk.eyJ1IjoibGR2MTIiLCJhIjoiY200eTRtdmRtMHJiOTJrcTc1dW15cG5teiJ9.MMYAJ5OuU2cXhgydFpRXHg";

const useMapViewModel = ({ mapData, busLines, stops, selectedStopCoordinates, mode, path, onMapClick }) => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const [error] = useState(null);
    const themeColor = "#22C55E";
    const highlightColor = "#16A34A";

    // Get stops that are part of the current navigation path
    const getStopsInPath = (path) => {
        if (!Array.isArray(path)) return new Set();

        const stopIds = new Set();
        path.forEach(segment => {
            if (segment.type === 'bus' && Array.isArray(segment.to)) {
                segment.to.forEach(stop => stopIds.add(stop.id));
            }
        });
        return stopIds;
    };

    const clearRouteLayers = (map) => {
        if (!map || !map.isStyleLoaded()) return;

        try {
            const layers = map.getStyle().layers;
            layers?.forEach((layer) => {
                if (layer.id.startsWith("path-") || layer.id.startsWith("line-") || layer.id.startsWith("arrow-")) {
                    if (map.getLayer(layer.id)) {
                        map.removeLayer(layer.id);
                    }
                    if (map.getSource(layer.id)) {
                        map.removeSource(layer.id);
                    }
                }
            });
        } catch (error) {
            console.error("Error clearing route layers:", error);
        }
    };
    const createArrowPoints = (coordinates, spacing = 100) => {
        const arrows = [];
        for (let i = 0; i < coordinates.length - 1; i++) {
            const start = coordinates[i];
            const end = coordinates[i + 1];

            const dx = end[0] - start[0];
            const dy = end[1] - start[1];
            const length = Math.sqrt(dx * dx + dy * dy);

            if (length < 0.0001) continue;

            const dirX = dx / length;
            const dirY = dy / length;

            const numArrows = Math.floor(length * 111000 / spacing);

            for (let j = 1; j <= numArrows; j++) {
                const t = j / (numArrows + 1);
                const point = [
                    start[0] + dx * t,
                    start[1] + dy * t
                ];

                const arrowSize = 0.0002;
                const arrowAngle = Math.atan2(dy, dx);
                arrows.push({
                    type: "Feature",
                    geometry: {
                        type: "LineString",
                        coordinates: [
                            [
                                point[0] - arrowSize * Math.cos(arrowAngle - Math.PI / 6),
                                point[1] - arrowSize * Math.sin(arrowAngle - Math.PI / 6)
                            ],
                            point,
                            [
                                point[0] - arrowSize * Math.cos(arrowAngle + Math.PI / 6),
                                point[1] - arrowSize * Math.sin(arrowAngle + Math.PI / 6)
                            ]
                        ]
                    }
                });
            }
        }
        return arrows;
    };

    const handleRouteDrawing = (map) => {
        if (!map.isStyleLoaded()) {
            map.once('style.load', () => handleRouteDrawing(map));
            return;
        }

        clearRouteLayers(map);

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
                            "line-color": themeColor,
                            "line-width": 4,
                        },
                    });

                    const arrows = createArrowPoints(routeCoordinates);
                    map.addSource(`arrow-${line.id}`, {
                        type: "geojson",
                        data: {
                            type: "FeatureCollection",
                            features: arrows
                        }
                    });

                    map.addLayer({
                        id: `arrow-${line.id}`,
                        type: "line",
                        source: `arrow-${line.id}`,
                        layout: {
                            "line-join": "round",
                            "line-cap": "round"
                        },
                        paint: {
                            "line-color": themeColor,
                            "line-width": 3
                        }
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

    useEffect(() => {
        if (mapRef.current) {
            const map = mapRef.current;
            let stopMarkers = [];
            const stopsInPath = getStopsInPath(path);

            const updateMarkersVisibility = () => {
                const currentZoom = Math.floor(map.getZoom());
                const maxZoom = 14;
                const minZoom = 10;
                const stopsToShow = Math.max(0, stops.length * (currentZoom - minZoom) / (maxZoom - minZoom));

                stopMarkers.forEach((marker, index) => {
                    if (index < stopsToShow) {
                        marker.getElement().style.display = "block";
                    } else {
                        marker.getElement().style.display = "none";
                    }
                });
            };

            const createCustomMarker = (stop) => {
                const el = document.createElement('div');
                el.className = 'bus-stop-marker';
                const isHighlighted = stopsInPath.has(stop.id);

                el.innerHTML = `
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="14" fill="${isHighlighted ? highlightColor : themeColor}" 
                                stroke="white" stroke-width="2"/>
                        <path d="M10 12h12v7H10v-7zm0 9h3v3h-3v-3zm9 0h3v3h-3v-3z" fill="white"/>
                        ${isHighlighted ? `
                            <circle cx="16" cy="16" r="6" fill="white" fill-opacity="0.3"/>
                            <circle cx="16" cy="16" r="3" fill="white"/>
                        ` : ''}
                    </svg>
                `;

                if (isHighlighted) {
                    el.classList.add('highlighted');
                }

                return el;
            };

            stopMarkers = stops.map((stop) => {
                return new mapboxgl.Marker({
                    element: createCustomMarker(stop)
                })
                    .setLngLat([stop.pointX, stop.pointY])
                    .setPopup(new mapboxgl.Popup({
                        offset: 25,
                        className: stopsInPath.has(stop.id) ? 'highlighted-popup' : ''
                    }).setHTML(`
                        <div class="stop-popup ${stopsInPath.has(stop.id) ? 'highlighted' : ''}">
                            <h3 style="color: ${stopsInPath.has(stop.id) ? highlightColor : themeColor}">
                                ${stop.name}
                            </h3>
                            ${stopsInPath.has(stop.id) ? '<p>Stop on current route</p>' : ''}
                        </div>
                    `))
                    .addTo(map);
            });

            map.on("zoom", updateMarkersVisibility);
            updateMarkersVisibility();

            return () => {
                stopMarkers.forEach((marker) => marker.remove());
                map.off("zoom", updateMarkersVisibility);
            };
        }
    }, [stops, path]);

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
            handleRouteDrawing(mapRef.current);
        }
    }, [busLines, mode]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const handlePathUpdate = () => {
            if (!map.isStyleLoaded()) {
                map.once('style.load', handlePathUpdate);
                return;
            }

            clearRouteLayers(map);

            if (Array.isArray(path) && path.length > 0) {
                const processSegments = async () => {
                    const allCoordinates = [];

                    for (let i = 0; i < path.length; i++) {
                        const { type, coords, to } = path[i];
                        let waypoints = '';
                        const color = themeColor;

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

                                    // Add main path
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

                                    // Add arrows
                                    const arrows = createArrowPoints(route.coordinates);
                                    const arrowSourceId = `arrow-${type}-${i}`;

                                    map.addSource(arrowSourceId, {
                                        type: "geojson",
                                        data: {
                                            type: "FeatureCollection",
                                            features: arrows
                                        }
                                    });

                                    map.addLayer({
                                        id: arrowSourceId,
                                        type: "line",
                                        source: arrowSourceId,
                                        layout: {
                                            "line-join": "round",
                                            "line-cap": "round"
                                        },
                                        paint: {
                                            "line-color": color,
                                            "line-width": 3
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