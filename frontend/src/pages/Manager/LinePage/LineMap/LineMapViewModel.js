import React, {useEffect, useRef, useState, useCallback} from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {transformLine, transformStop} from "@/utils/Transformer.js";
import LineService from "@/services/LineService.js";
import StopService from "@/services/StopService.js";

const useLineMapViewModel = ({currentLine, mode, onLineUpdate}) => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const [stops, setStops] = useState([]);
    const [lines, setLines] = useState([]);
    const [selectedLine, setSelectedLine] = useState(null);
    const [showLineForm, setShowLineForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '', start_place: null, end_place: null, time: 0, arr_stop: []
    });

    // Fetch stops and lines
    const fetchStops = useCallback(async () => {
        try {
            const response = await StopService.getStops();
            const rawStops = response.data;
            setStops(rawStops.map(transformStop));
        } catch (error) {
            console.error("Failed to fetch stops:", error);
        }
    }, []);

    const fetchLines = useCallback(async () => {
        try {
            const response = await LineService.getLines();
            const rawLines = response.data;
            const sortedLines = rawLines
                .map(transformLine)
                .sort((a, b) => a.name.localeCompare(b.name));
            setLines(sortedLines);
        } catch (error) {
            console.error("Error fetching lines:", error);
        }
    }, []);

    useEffect(() => {
        fetchStops();
        fetchLines();
    }, [fetchLines, fetchStops]);

    // Initialize map
    useEffect(() => {
        if (!mapRef.current && mapContainerRef.current) {
            mapRef.current = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [106.6297, 10.8231], // Ho Chi Minh City coordinates
                zoom: 12
            });

            // Add navigation control
            mapRef.current.addControl(new mapboxgl.NavigationControl());
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Update map when stops or lines change
    useEffect(() => {
        if (!mapRef.current) return;

        // Add stops markers
        stops.forEach(stop => {
            const marker = new mapboxgl.Marker()
                .setLngLat([stop.pointX, stop.pointY])
                .setPopup(new mapboxgl.Popup().setHTML(`<h3>${stop.name}</h3><p>${stop.address}</p>`))
                .addTo(mapRef.current);
        });

        // Draw selected line
        if (selectedLine) {
            const coordinates = [[selectedLine.start_place.pointX, selectedLine.start_place.pointY], ...selectedLine.arr_stop.map(stop => [stop.pointX, stop.pointY]), [selectedLine.end_place.pointX, selectedLine.end_place.pointY]];

            if (mapRef.current.getSource('route')) {
                mapRef.current.removeLayer('route');
                mapRef.current.removeSource('route');
            }

            mapRef.current.addSource('route', {
                type: 'geojson', data: {
                    type: 'Feature', properties: {}, geometry: {
                        type: 'LineString', coordinates: coordinates
                    }
                }
            });

            mapRef.current.addLayer({
                id: 'route', type: 'line', source: 'route', layout: {
                    'line-join': 'round', 'line-cap': 'round'
                }, paint: {
                    'line-color': '#888', 'line-width': 8
                }
            });
        }
    }, [stops, selectedLine]);

    // Handle stop reordering
    return {
        mapContainerRef,
        stops,
        lines,
        selectedLine,
        showLineForm,
        formData,
        setSelectedLine,
        setShowLineForm,
        setFormData,
    };
};

export default useLineMapViewModel;