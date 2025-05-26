import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

mapboxgl.accessToken =  import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const LineDetailsPopup = ({ line, onClose }) => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef([]);

    const flyToLocation = (pointX, pointY) => {
        mapRef.current.flyTo({
            center: [pointX, pointY],
            zoom: 15,
            duration: 2000
        });
    };

    useEffect(() => {
        if (!mapRef.current && mapContainerRef.current) {
            mapRef.current = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: "mapbox://styles/mapbox/streets-v11",
                center: [106.70098, 10.77584],
                zoom: 12,
                maxZoom: 17,
                minZoom: 9
            });

            mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const map = mapRef.current;
        if (!map || !line) return;

        const setupMap = () => {
            markersRef.current.forEach(marker => marker.remove());
            markersRef.current = [];

            const layers = map.getStyle().layers;
            if (layers) {
                layers.forEach((layer) => {
                    if (layer.id.startsWith('route-') || layer.id.startsWith('line-')) {
                        map.removeLayer(layer.id);
                        map.removeSource(layer.id);
                    }
                });
            }

            const allStops = [
                line.start_place,
                ...(line.arr_stop || []),
                line.end_place
            ].filter(stop => stop && stop.pointX && stop.pointY);

            markersRef.current = allStops.map((stop, index) => {
                const color = index === 0 ? "#22c55e" :
                    index === allStops.length - 1 ? "#ef4444" :
                        "#3b82f6";

                const marker = new mapboxgl.Marker({ color })
                    .setLngLat([stop.pointX, stop.pointY])
                    .setPopup(new mapboxgl.Popup().setHTML(`<h3>${stop.name}</h3>`))
                    .addTo(map);

                return marker;
            });

            const waypoints = allStops
                .map(stop => `${stop.pointX},${stop.pointY}`)
                .join(';');

            const fetchAndDrawRoute = async () => {
                try {
                    const response = await fetch(
                        `https://api.mapbox.com/directions/v5/mapbox/driving/${waypoints}?geometries=geojson&access_token=${mapboxgl.accessToken}`
                    );
                    const data = await response.json();

                    if (data.routes && data.routes.length > 0) {
                        const route = data.routes[0].geometry;

                        map.addSource('route-source', {
                            type: 'geojson',
                            data: {
                                type: 'Feature',
                                properties: {},
                                geometry: route
                            }
                        });

                        map.addLayer({
                            id: 'route-layer',
                            type: 'line',
                            source: 'route-source',
                            layout: {
                                'line-join': 'round',
                                'line-cap': 'round'
                            },
                            paint: {
                                'line-color': '#007cbf',
                                'line-width': 4
                            }
                        });

                        const bounds = allStops.reduce(
                            (bounds, stop) => bounds.extend([stop.pointX, stop.pointY]),
                            new mapboxgl.LngLatBounds([allStops[0].pointX, allStops[0].pointY], [allStops[0].pointX, allStops[0].pointY])
                        );

                        map.fitBounds(bounds, {
                            padding: 50
                        });
                    }
                } catch (error) {
                    console.error('Error fetching route:', error);
                }
            };

            fetchAndDrawRoute();
        };

        if (map.isStyleLoaded()) {
            setupMap();
        } else {
            map.on('style.load', setupMap);
        }

        return () => {
            map.off('style.load', setupMap);
        };
    }, [line]);

    if (!line) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl m-4">
                <div className="grid grid-cols-5 gap-4 p-6">
                    <div className="col-span-2 space-y-4">
                        <CardHeader className="p-0">
                            <CardTitle className="text-xl font-bold text-green-600">Line Details</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 space-y-4">
                            <div>
                                <label className="font-semibold text-sm text-gray-600">Line Name</label>
                                <p className="mt-1">{line.name}</p>
                            </div>
                            <div>
                                <label className="font-semibold text-sm text-gray-600">Start Place</label>
                                <p className="mt-1 cursor-pointer hover:text-green-600"
                                   onClick={() => flyToLocation(line.start_place.pointX, line.start_place.pointY)}>
                                    {line.start_place?.name}
                                </p>
                            </div>
                            <div>
                                <label className="font-semibold text-sm text-gray-600">Stops</label>
                                <div className="mt-1 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                    {line.arr_stop?.map((stop, index) => (
                                        <div
                                            key={index}
                                            className="bg-gray-50 p-2 rounded mb-2 cursor-pointer hover:bg-gray-100"
                                            onClick={() => flyToLocation(stop.pointX, stop.pointY)}
                                        >
                                            {stop.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="font-semibold text-sm text-gray-600">End Place</label>
                                <p className="mt-1 cursor-pointer hover:text-red-600"
                                   onClick={() => flyToLocation(line.end_place.pointX, line.end_place.pointY)}>
                                    {line.end_place?.name}
                                </p>
                            </div>
                            <div>
                                <label className="font-semibold text-sm text-gray-600">Time</label>
                                <p className="mt-1">{line.time} minutes</p>
                            </div>
                        </CardContent>
                    </div>
                    <div className="col-span-3">
                        <div ref={mapContainerRef} className="h-[400px] w-full h-full rounded-lg border" />
                    </div>
                </div>
                <div className="flex justify-end p-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LineDetailsPopup;