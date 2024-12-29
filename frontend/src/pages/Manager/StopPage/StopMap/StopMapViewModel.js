import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import StopService from "@/services/StopService.js";
import { transformStop } from "@/utils/Transformer.js";

mapboxgl.accessToken = 'pk.eyJ1IjoibGR2MTIiLCJhIjoiY200eTRtdmRtMHJiOTJrcTc1dW15cG5teiJ9.MMYAJ5OuU2cXhgydFpRXHg';

const useStopMapViewModel = ({
                                 selectedStopCoordinates,
                                 mode,
                                 onMapClick,
                                 styles,
                                 isStation
                             }) => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef([]);
    const clickIndicatorRef = useRef(null);

    const [stops, setStops] = useState([]);
    const [mapInitialized, setMapInitialized] = useState(false);

    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);

        return () => {
            document.head.removeChild(styleSheet);
        };
    }, [styles]);

    const createClickIndicator = (lngLat, isStation) => {
        if (clickIndicatorRef.current) {
            clickIndicatorRef.current.remove();
        }

        const el = document.createElement('div');
        el.className = `map-click-indicator ${isStation ? 'station' : 'stop'}`;

        const marker = new mapboxgl.Marker({
            element: el,
            anchor: 'center'
        })
            .setLngLat(lngLat)
            .addTo(mapRef.current);

        clickIndicatorRef.current = marker;
    };

    const fetchStops = useCallback(async () => {
        try {
            const response = await StopService.getStops();
            const rawStops = response.data;
            setStops(rawStops.map(transformStop));
        } catch (error) {
            console.error("Failed to fetch stops:", error);
        }
    }, []);

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [106.660172, 10.762622],
            zoom: 12
        });

        mapRef.current.on('load', () => {
            setMapInitialized(true);
        });

        mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        return () => {
            if (mapRef.current) {
                markersRef.current.forEach(marker => marker.remove());
                if (clickIndicatorRef.current) {
                    clickIndicatorRef.current.remove();
                }
                mapRef.current.remove();
                mapRef.current = null;
                markersRef.current = [];
            }
        };
    }, []);

    useEffect(() => {
        fetchStops();
    }, [fetchStops]);

    useEffect(() => {
        if (!mapRef.current || !mapInitialized) return;

        const handleMapClick = async (e) => {
            if (mode !== 'add' && mode !== 'edit') return;

            const { lngLat } = e;
            createClickIndicator(lngLat, isStation);

            try {
                const response = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat.lng},${lngLat.lat}.json?access_token=${mapboxgl.accessToken}`
                );
                const data = await response.json();
                const address = data.features[0]?.place_name || 'Address not found';

                const locationData = {
                    pointX: lngLat.lng.toString(),
                    pointY: lngLat.lat.toString(),
                    address
                };

                onMapClick(locationData);
            } catch (error) {
                console.error('Error getting address:', error);
            }
        };

        mapRef.current.on('click', handleMapClick);

        return () => {
            if (mapRef.current) {
                mapRef.current.off('click', handleMapClick);
            }
        };
    }, [mode, onMapClick, mapInitialized, isStation]);

    useEffect(() => {
        if (!mapRef.current || !mapInitialized || !stops.length) return;

        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        stops.forEach(stop => {
            const pointX = parseFloat(stop.pointX);
            const pointY = parseFloat(stop.pointY);

            if (isNaN(pointX) || isNaN(pointY)) {
                console.warn(`Invalid coordinates for stop ${stop.id}`);
                return;
            }

            const el = document.createElement('div');
            el.className = 'marker';
            el.style.backgroundColor = stop.isStation ? '#4CAF50' : '#2196F3';
            el.style.width = '15px';
            el.style.height = '15px';
            el.style.borderRadius = '50%';
            el.style.border = '2px solid white';

            const popup = new mapboxgl.Popup({ offset: 25 })
                .setHTML(`
                    <strong>${stop.name}</strong><br>
                    ${stop.address}<br>
                    ${stop.isStation ? 'Station' : 'Stop'}
                `);

            try {
                const marker = new mapboxgl.Marker(el)
                    .setLngLat([pointX, pointY])
                    .setPopup(popup)
                    .addTo(mapRef.current);

                markersRef.current.push(marker);
            } catch (error) {
                console.error(`Error adding marker for stop ${stop.id}:`, error);
            }
        });
    }, [stops, mapInitialized]);

    useEffect(() => {
        if (!mapRef.current || !mapInitialized || !selectedStopCoordinates) return;

        const [lng, lat] = selectedStopCoordinates;
        if (!isNaN(lng) && !isNaN(lat)) {
            mapRef.current.flyTo({
                center: [lng, lat],
                zoom: 15,
                duration: 1000
            });
        }
    }, [selectedStopCoordinates, mapInitialized]);

    return {
        mapContainerRef
    };
};

export default useStopMapViewModel;