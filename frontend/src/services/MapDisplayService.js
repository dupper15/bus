import mapBoxFacade from "@/services/MapBoxFacade.js";


/**
 * MapDisplayService handles all map visualization operations including
 * route display, marker management, and map interactions.
 */
class MapDisplayService {
    constructor() {
        this.mapBoxFacade = mapBoxFacade;
        this.themeColor = "#22C55E";
        this.highlightColor = "#16A34A";
        this.stopMarkers = new Map();
    }

    /**
     * Initializes a new map instance
     * @param {HTMLElement} container - DOM element for the map
     * @param {Object} options - Map configuration options
     * @returns {Object} - Map instance
     */
    initializeMap(container, options = {}) {
        const map = this.mapBoxFacade.createMap(container, options);
        this.mapBoxFacade.addNavigationControls(map);
        return map;
    }

    /**
     * Displays a bus route on the map
     * @param {Object} map - Map instance
     * @param {Object} route - Route data
     * @param {Object} options - Display options
     */
    async displayRoute(map, route, options = {}) {
        const { id, coordinates, mode = 'outbound' } = route;
        const routeCoords = mode === 'inbound'
            ? [...coordinates].reverse()
            : coordinates;

        await this.mapBoxFacade.waitForStyleLoad(map);

        // Clear existing route layers
        this.clearRoute(map);

        // Add main route line
        this.mapBoxFacade.addRouteLayer(map, {
            id: `line-${id}`,
            coordinates: routeCoords,
            color: options.color || this.themeColor,
            width: options.width || 4
        });

        // Add direction arrows
        if (options.showArrows !== false) {
            this.addRouteArrows(map, `arrow-${id}`, routeCoords);
        }
    }

    /**
     * Displays bus stops on the map
     * @param {Object} map - Map instance
     * @param {Array} stops - Array of bus stops
     * @param {Object} options - Display options
     */
    displayBusStops(map, stops, options = {}) {
        // Clear existing stop markers
        this.clearStopMarkers();

        const stopsInPath = options.highlightStops || new Set();

        stops.forEach((stop) => {
            const isHighlighted = stopsInPath.has(stop.id);
            const markerElement = this.createBusStopMarker(stop, isHighlighted);

            const marker = this.mapBoxFacade.placeMarker(map, {
                coordinates: [stop.pointX, stop.pointY],
                element: markerElement,
                id: `stop-${stop.id}`,
                popup: {
                    html: this.createStopPopupContent(stop, isHighlighted),
                    className: isHighlighted ? 'highlighted-popup' : ''
                }
            });

            this.stopMarkers.set(stop.id, marker);
        });

        // Set up zoom-based visibility
        this.setupStopVisibility(map, stops);
    }

    /**
     * Creates a bus stop marker element
     * @param {Object} stop - Bus stop data
     * @param {boolean} isHighlighted - Whether to highlight the stop
     * @returns {HTMLElement} - Marker DOM element
     */
    createBusStopMarker(stop, isHighlighted = false) {
        const config = {
            className: `bus-stop-marker ${isHighlighted ? 'highlighted' : ''}`,
            html: `
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="14" fill="${isHighlighted ? this.highlightColor : this.themeColor}" 
                            stroke="white" stroke-width="2"/>
                    <path d="M10 12h12v7H10v-7zm0 9h3v3h-3v-3zm9 0h3v3h-3v-3z" fill="white"/>
                    ${isHighlighted ? `
                        <circle cx="16" cy="16" r="6" fill="white" fill-opacity="0.3"/>
                        <circle cx="16" cy="16" r="3" fill="white"/>
                    ` : ''}
                </svg>
            `
        };

        return this.mapBoxFacade.createMarkerElement(config);
    }

    /**
     * Creates popup content for a bus stop
     * @param {Object} stop - Bus stop data
     * @param {boolean} isHighlighted - Whether the stop is highlighted
     * @returns {string} - HTML content for popup
     */
    createStopPopupContent(stop, isHighlighted) {
        return `
            <div class="stop-popup ${isHighlighted ? 'highlighted' : ''}">
                <h3 style="color: ${isHighlighted ? this.highlightColor : this.themeColor}">
                    ${stop.name}
                </h3>
                ${stop.address ? `<p>${stop.address}</p>` : ''}
                ${isHighlighted ? '<p>Stop on current route</p>' : ''}
            </div>
        `;
    }

    /**
     * Sets up zoom-based visibility for bus stops
     * @param {Object} map - Map instance
     * @param {Array} stops - Array of bus stops
     */
    setupStopVisibility(map, stops) {
        const updateVisibility = () => {
            const currentZoom = Math.floor(this.mapBoxFacade.getZoom(map));
            const maxZoom = 14;
            const minZoom = 10;
            const stopsToShow = Math.max(
                0,
                stops.length * (currentZoom - minZoom) / (maxZoom - minZoom)
            );

            let index = 0;
            this.stopMarkers.forEach((marker) => {
                const element = marker.getElement();
                if (element) {
                    element.style.display = index < stopsToShow ? "block" : "none";
                }
                index++;
            });
        };

        this.mapBoxFacade.setMapEventHandler(map, "zoom", updateVisibility);
        updateVisibility();
    }

    /**
     * Displays a navigation path with multiple segments
     * Enhanced to handle transformed path structure from PathTransformerService
     * @param {Object} map - Map instance
     * @param {Array} pathSegments - Array of path segments (transformed format)
     */
    async displayNavigationPath(map, pathSegments) {
        await this.mapBoxFacade.waitForStyleLoad(map);

        // Clear existing paths
        this.clearRoute(map);

        console.log('MapDisplayService received path segments:', pathSegments); // Debug log

        const allCoordinates = [];

        // Process each segment
        for (let i = 0; i < pathSegments.length; i++) {
            const segment = pathSegments[i];
            const segmentId = `path-${segment.type}-${i}`;

            // Handle both 'coords' (transformed) and 'coordinates' (original) properties
            const segmentCoords = segment.coords || segment.coordinates || [];

            if (segmentCoords && segmentCoords.length > 0) {
                allCoordinates.push(...segmentCoords);

                // Add main path
                this.mapBoxFacade.addRouteLayer(map, {
                    id: segmentId,
                    coordinates: segmentCoords, // MapBoxFacade expects 'coordinates'
                    color: this.themeColor,
                    width: 4
                });

                // Add arrows for direction
                this.addRouteArrows(map, `arrow-${segment.type}-${i}`, segmentCoords);
            } else {
                console.warn(`Segment ${i} has no coordinates:`, segment);
            }
        }

        // Fit map to show entire path
        if (allCoordinates.length > 0) {
            try {
                const bounds = this.mapBoxFacade.createBounds(allCoordinates);
                this.mapBoxFacade.fitBounds(map, bounds);
            } catch {
                console.warn('No coordinates found in any path segments');
            }
        }
    }

    /**
     * Adds directional arrows to a route
     * @param {Object} map - Map instance
     * @param {string} id - Layer ID for arrows
     * @param {Array} coordinates - Route coordinates
     */
    addRouteArrows(map, id, coordinates) {
        const arrows = this.createArrowPoints(coordinates);

        map.addSource(id, {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: arrows
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
                "line-color": this.themeColor,
                "line-width": 3
            }
        });
    }

    /**
     * Creates arrow points for route direction visualization
     * @param {Array} coordinates - Route coordinates
     * @param {number} spacing - Spacing between arrows in meters
     * @returns {Array} - Array of arrow features
     */
    createArrowPoints(coordinates, spacing = 100) {
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
    }

    /**
     * Clears all route layers from the map
     * @param {Object} map - Map instance
     */
    clearRoute(map) {
        this.mapBoxFacade.clearRouteLayers(map, "path-");
        this.mapBoxFacade.clearRouteLayers(map, "line-");
        this.mapBoxFacade.clearRouteLayers(map, "arrow-");
    }

    /**
     * Clears all stop markers from the map
     */
    clearStopMarkers() {
        this.stopMarkers.forEach((marker, id) => {
            this.mapBoxFacade.removeMarker(id);
        });
        this.stopMarkers.clear();
    }

    /**
     * Focuses the map on a specific location
     * @param {Object} map - Map instance
     * @param {Array} coordinates - [lng, lat] coordinates
     * @param {Object} options - Animation options
     */
    focusOnLocation(map, coordinates, options = {}) {
        this.mapBoxFacade.flyTo(map, coordinates, options);
    }

    /**
     * Sets up click handler for location selection
     * @param {Object} map - Map instance
     * @param {Function} callback - Click handler callback
     */
    setLocationClickHandler(map, callback) {
        this.mapBoxFacade.setMapEventHandler(map, "click", (e) => {
            const coordinates = [e.lngLat.lng, e.lngLat.lat];
            callback(coordinates);
        });
    }

    /**
     * Removes click handler from map
     * @param {Object} map - Map instance
     * @param {Function} callback - Handler to remove
     */
    removeLocationClickHandler(map, callback) {
        this.mapBoxFacade.removeMapEventHandler(map, "click", callback);
    }

    /**
     * Gets stops that are part of a navigation path
     * @param {Array} path - Navigation path segments
     * @returns {Set} - Set of stop IDs in the path
     */
    getStopsInPath(path) {
        if (!Array.isArray(path)) return new Set();

        const stopIds = new Set();
        path.forEach(segment => {
            if (segment.type === 'bus' && Array.isArray(segment.to)) {
                segment.to.forEach(stop => stopIds.add(stop.id));
            }
        });
        return stopIds;
    }

    /**
     * Cleans up map resources
     * @param {Object} map - Map instance
     */
    cleanup(map) {
        this.clearRoute(map);
        this.clearStopMarkers();
        // Additional cleanup if needed
    }
}

// Export singleton instance
const mapDisplayService = new MapDisplayService();
export default mapDisplayService;