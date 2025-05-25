import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

/**
 * MapBoxFacade provides a simplified interface to MapBox API functionality.
 * This facade encapsulates all direct MapBox API interactions and provides
 * a cleaner, more maintainable interface for the rest of the application.
 */
class MapBoxFacade {
    constructor(accessToken) {
        this.accessToken = accessToken;
        mapboxgl.accessToken = accessToken;
        this.activeMarkers = new Map();
        this.activeLayers = new Map();
        this.activeSources = new Map();
    }

    /**
     * Creates and initializes a new MapBox map instance
     * @param {Object} options - Map configuration options
     * @returns {mapboxgl.Map} - The created map instance
     */
    createMap(container, options = {}) {
        const defaultOptions = {
            style: "mapbox://styles/mapbox/streets-v11",
            center: [106.70098, 10.77584], // Ho Chi Minh City
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

    /**
     * Adds navigation controls to the map
     * @param {mapboxgl.Map} map - The map instance
     * @param {string} position - Control position
     */
    addNavigationControls(map, position = "top-right") {
        map.addControl(new mapboxgl.NavigationControl(), position);
    }

    /**
     * Calculates directions between waypoints
     * @param {Array} coordinates - Array of [lng, lat] coordinates
     * @param {string} profile - Routing profile (driving, walking, etc.)
     * @returns {Promise<Object>} - Route data from MapBox Directions API
     */
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

    /**
     * Places a marker on the map
     * @param {mapboxgl.Map} map - The map instance
     * @param {Object} options - Marker configuration
     * @returns {mapboxgl.Marker} - The created marker
     */
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

    /**
     * Creates a custom marker element
     * @param {Object} config - Marker visual configuration
     * @returns {HTMLElement} - The marker DOM element
     */
    createMarkerElement(config) {
        const el = document.createElement('div');
        el.className = config.className || 'custom-marker';
        el.innerHTML = config.html || '';

        if (config.styles) {
            Object.assign(el.style, config.styles);
        }

        return el;
    }

    /**
     * Adds a route layer to the map
     * @param {mapboxgl.Map} map - The map instance
     * @param {Object} routeData - Route configuration
     */
    addRouteLayer(map, routeData) {
        const { id, coordinates, color = "#22C55E", width = 4 } = routeData;

        // Remove existing layer if present
        this.removeLayer(map, id);

        // Add source
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

        // Add layer
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

    /**
     * Removes a layer from the map
     * @param {mapboxgl.Map} map - The map instance
     * @param {string} layerId - The layer ID to remove
     */
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

    /**
     * Clears all route-related layers from the map
     * @param {mapboxgl.Map} map - The map instance
     * @param {string} prefix - Layer ID prefix to match
     */
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

    /**
     * Creates bounds that encompass all provided coordinates
     * @param {Array} coordinates - Array of [lng, lat] coordinates
     * @returns {mapboxgl.LngLatBounds} - The calculated bounds
     */
    createBounds(coordinates) {
        if (!coordinates || coordinates.length === 0) return null;

        return coordinates.reduce(
            (bounds, coord) => bounds.extend(coord),
            new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
        );
    }

    /**
     * Fits the map view to specified bounds
     * @param {mapboxgl.Map} map - The map instance
     * @param {mapboxgl.LngLatBounds} bounds - The bounds to fit
     * @param {Object} options - Fit options
     */
    fitBounds(map, bounds, options = {}) {
        const defaultOptions = { padding: 50 };
        map.fitBounds(bounds, { ...defaultOptions, ...options });
    }

    /**
     * Flies to a specific location on the map
     * @param {mapboxgl.Map} map - The map instance
     * @param {Array} center - [lng, lat] coordinates
     * @param {Object} options - Animation options
     */
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

    /**
     * Removes a specific marker from the map
     * @param {string} markerId - The marker ID to remove
     */
    removeMarker(markerId) {
        const marker = this.activeMarkers.get(markerId);
        if (marker) {
            marker.remove();
            this.activeMarkers.delete(markerId);
        }
    }

    /**
     * Removes all markers from the map
     */
    clearAllMarkers() {
        this.activeMarkers.forEach(marker => marker.remove());
        this.activeMarkers.clear();
    }

    /**
     * Sets map event handlers
     * @param {mapboxgl.Map} map - The map instance
     * @param {string} event - Event name
     * @param {Function} handler - Event handler function
     */
    setMapEventHandler(map, event, handler) {
        map.on(event, handler);
    }

    /**
     * Removes map event handlers
     * @param {mapboxgl.Map} map - The map instance
     * @param {string} event - Event name
     * @param {Function} handler - Event handler function
     */
    removeMapEventHandler(map, event, handler) {
        map.off(event, handler);
    }

    /**
     * Checks if the map style is loaded
     * @param {mapboxgl.Map} map - The map instance
     * @returns {boolean} - Whether the style is loaded
     */
    isStyleLoaded(map) {
        return map.isStyleLoaded();
    }

    /**
     * Waits for the map style to load
     * @param {mapboxgl.Map} map - The map instance
     * @returns {Promise} - Resolves when style is loaded
     */
    waitForStyleLoad(map) {
        return new Promise((resolve) => {
            if (map.isStyleLoaded()) {
                resolve();
            } else {
                map.once('style.load', resolve);
            }
        });
    }

    /**
     * Gets the current map zoom level
     * @param {mapboxgl.Map} map - The map instance
     * @returns {number} - Current zoom level
     */
    getZoom(map) {
        return map.getZoom();
    }

    /**
     * Creates a LngLat object from coordinates
     * @param {Array} coordinates - [lng, lat] array
     * @returns {mapboxgl.LngLat} - LngLat object
     */
    createLngLat(coordinates) {
        return new mapboxgl.LngLat(coordinates[0], coordinates[1]);
    }
}

// Export singleton instance
const mapBoxFacade = new MapBoxFacade("pk.eyJ1IjoibGR2MTIiLCJhIjoiY200eTRtdmRtMHJiOTJrcTc1dW15cG5teiJ9.MMYAJ5OuU2cXhgydFpRXHg");
export default mapBoxFacade;