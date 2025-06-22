import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

class MapBoxFacade {
    constructor(accessToken) {
        this.accessToken = accessToken;
        mapboxgl.accessToken = accessToken;
        this.activeMarkers = new Map();
        this.activeLayers = new Map();
        this.activeSources = new Map();
    }

    createMap(container, options = {}) {
        const defaultOptions = {
            style: "mapbox://styles/mapbox/streets-v11",
            center: [106.70098, 10.77584],
            zoom: 13,
            maxZoom: 17,
            minZoom: 9
        };

        const map = new mapboxgl.Map({
            container,
            ...defaultOptions,
            ...options
        });

        return map;
    }

    addNavigationControls(map, position = "top-right") {
        map.addControl(new mapboxgl.NavigationControl(), position);
    }

    async getDirections(coordinates, profile = "driving") {
        const waypoints = coordinates
            .map(coord => `${coord[0]},${coord[1]}`)
            .join(';');

        const response = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/${profile}/${waypoints}?geometries=geojson&access_token=${this.accessToken}`
        );

        if (!response.ok) {
            throw new Error(`Directions API error: ${response.statusText}`);
        }

        return await response.json();
    }

    placeMarker(map, options) {
        const { coordinates, element, popup, id } = options;

        const marker = new mapboxgl.Marker({
            element: element || undefined
        })
            .setLngLat(coordinates);

        if (popup) {
            const mapboxPopup = new mapboxgl.Popup({
                offset: popup.offset || 25,
                className: popup.className || ''
            }).setHTML(popup.html || '');

            marker.setPopup(mapboxPopup);
        }

        marker.addTo(map);

        if (id) {
            this.activeMarkers.set(id, marker);
        }

        return marker;
    }

    createMarkerElement(config) {
        const el = document.createElement('div');
        el.className = config.className || 'custom-marker';
        el.innerHTML = config.html || '';

        if (config.styles) {
            Object.assign(el.style, config.styles);
        }

        return el;
    }

    addRouteLayer(map, routeData) {
        const { id, coordinates, color = "#22C55E", width = 4 } = routeData;

        this.removeLayer(map, id);

        map.addSource(id, {
            type: "geojson",
            data: {
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: coordinates
                }
            }
        });

        map.addLayer({
            id: id,
            type: "line",
            source: id,
            layout: {
                "line-join": "round",
                "line-cap": "round"
            },
            paint: {
                "line-color": color,
                "line-width": width
            }
        });

        this.activeLayers.set(id, true);
        this.activeSources.set(id, true);
    }

    removeLayer(map, layerId) {
        if (map.getLayer(layerId)) {
            map.removeLayer(layerId);
            this.activeLayers.delete(layerId);
        }
        if (map.getSource(layerId)) {
            map.removeSource(layerId);
            this.activeSources.delete(layerId);
        }
    }

    clearRouteLayers(map, prefix = "path-") {
        if (!map || !map.isStyleLoaded()) return;

        try {
            const layers = map.getStyle().layers;
            layers?.forEach((layer) => {
                if (layer.id.startsWith(prefix)) {
                    this.removeLayer(map, layer.id);
                }
            });
        } catch (error) {
            console.error("Error clearing route layers:", error);
        }
    }

    createBounds(coordinates) {
        if (!coordinates || coordinates.length === 0) return null;

        return coordinates.reduce(
            (bounds, coord) => bounds.extend(coord),
            new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
        );
    }

    fitBounds(map, bounds, options = {}) {
        const defaultOptions = { padding: 50 };
        map.fitBounds(bounds, { ...defaultOptions, ...options });
    }

    flyTo(map, center, options = {}) {
        const defaultOptions = {
            zoom: 15,
            essential: true
        };

        map.flyTo({
            center,
            ...defaultOptions,
            ...options
        });
    }

    removeMarker(markerId) {
        const marker = this.activeMarkers.get(markerId);
        if (marker) {
            marker.remove();
            this.activeMarkers.delete(markerId);
        }
    }

    clearAllMarkers() {
        this.activeMarkers.forEach(marker => marker.remove());
        this.activeMarkers.clear();
    }

    setMapEventHandler(map, event, handler) {
        map.on(event, handler);
    }

    removeMapEventHandler(map, event, handler) {
        map.off(event, handler);
    }

    isStyleLoaded(map) {
        return map.isStyleLoaded();
    }

    waitForStyleLoad(map) {
        return new Promise((resolve) => {
            if (map.isStyleLoaded()) {
                resolve();
            } else {
                map.once('style.load', resolve);
            }
        });
    }

    getZoom(map) {
        return map.getZoom();
    }

    createLngLat(coordinates) {
        return new mapboxgl.LngLat(coordinates[0], coordinates[1]);
    }
}

const mapBoxFacade = new MapBoxFacade(import.meta.env.VITE_MAPBOX_ACCESS_TOKEN);
export default mapBoxFacade;