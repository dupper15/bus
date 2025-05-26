import mapBoxFacade from "@/services/MapBoxFacade.js";

/**
 * MapDisplayService handles all map visualization operations including
 * route display, marker management, and map interactions.
 * Enhanced with smart stop filtering based on zoom and viewport
 */
class MapDisplayService {
    constructor() {
        this.mapBoxFacade = mapBoxFacade;
        this.themeColor = "#22C55E";
        this.highlightColor = "#16A34A";

        // Colors for different segment types
        this.segmentColors = {
            walking: "#3B82F6",    // Blue for walking
            bus: "#22C55E",        // Green for bus
            transfer: "#F59E0B"    // Orange for transfers
        };

        this.stopMarkers = new Map();
        this.allStops = []; // Store all stops for filtering
        this.currentZoom = 13;
        this.currentBounds = null;
        this.isUpdatingStops = false;

        // Click handler management
        this.currentClickHandler = null;
        this.activeMap = null; // Store active map reference

        // Zoom-based stop density configuration
        this.zoomConfig = {
            9: { maxStops: 10, gridSize: 0.05, showOnlyMajor: true },
            10: { maxStops: 20, gridSize: 0.03, showOnlyMajor: true },
            11: { maxStops: 50, gridSize: 0.02, showOnlyMajor: false },
            12: { maxStops: 100, gridSize: 0.015, showOnlyMajor: false },
            13: { maxStops: 200, gridSize: 0.01, showOnlyMajor: false },
            14: { maxStops: 400, gridSize: 0.008, showOnlyMajor: false },
            15: { maxStops: 600, gridSize: 0.005, showOnlyMajor: false },
            16: { maxStops: 1000, gridSize: 0.003, showOnlyMajor: false },
            17: { maxStops: 1500, gridSize: 0.002, showOnlyMajor: false }
        };
    }

    /**
     * Initializes a new map instance with stop filtering
     * @param {HTMLElement} container - DOM element for the map
     * @param {Object} options - Map configuration options
     * @returns {Object} - Map instance
     */
    initializeMap(container, options = {}) {
        const map = this.mapBoxFacade.createMap(container, options);
        this.mapBoxFacade.addNavigationControls(map);
        this.activeMap = map; // Store map reference

        // Set up event listeners for smart stop filtering
        this.setupStopFiltering(map);

        return map;
    }

    /**
     * Sets up smart stop filtering based on zoom and pan events
     * @param {Object} map - Map instance
     */
    setupStopFiltering(map) {
        // Debounced update function to prevent excessive calls
        let updateTimeout;
        const debouncedUpdate = () => {
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => {
                this.updateVisibleStops(map);
            }, 150);
        };

        // Listen for zoom changes using direct MapBox event handlers
        map.on('zoom', () => {
            this.currentZoom = this.mapBoxFacade.getZoom(map);
            debouncedUpdate();
        });

        // Listen for pan/move events
        map.on('moveend', () => {
            this.currentBounds = map.getBounds();
            debouncedUpdate();
        });

        // Initial setup
        map.on('load', () => {
            this.currentZoom = this.mapBoxFacade.getZoom(map);
            this.currentBounds = map.getBounds();
            if (this.allStops.length > 0) {
                this.updateVisibleStops(map);
            }
        });
    }

    /**
     * Sets up click handler for location selection with proper cleanup
     * @param {Object} map - Map instance
     * @param {Function} callback - Click handler callback
     */
    setLocationClickHandler(map, callback) {
        console.log('Setting location click handler:', callback ? 'provided' : 'null');

        // Remove any existing click handlers first
        if (this.currentClickHandler && this.activeMap) {
            console.log('Removing existing click handler');
            this.removeLocationClickHandler(this.activeMap, this.currentClickHandler);
        }

        if (callback && typeof callback === 'function') {
            // Create wrapped handler for proper cleanup tracking
            const wrappedHandler = (e) => {
                // Extract coordinates from MapBox event
                const coordinates = [e.lngLat.lng, e.lngLat.lat];
                console.log('MapBox click event - coordinates extracted:', coordinates);

                // Ensure we have valid coordinates before calling callback
                if (Array.isArray(coordinates) && coordinates.length === 2 &&
                    typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
                    callback(coordinates);
                } else {
                    console.error('Invalid coordinates extracted from MapBox event:', coordinates);
                }
            };

            // Store reference for cleanup
            this.currentClickHandler = wrappedHandler;
            this.activeMap = map;

            // Add the event listener directly to the map
            map.on("click", wrappedHandler);
            console.log('Click handler set successfully');
        } else {
            this.currentClickHandler = null;
        }
    }

    /**
     * Removes click handler from map
     * @param {Object} map - Map instance
     * @param {Function} callback - Handler to remove
     */
    removeLocationClickHandler(map, callback) {
        console.log('Removing location click handler');

        if (callback && map) {
            try {
                // Remove the event listener directly from the map
                map.off("click", callback);
                console.log('Click handler removed successfully');
            } catch (error) {
                console.warn('Error removing click handler:', error);
            }
        }

        // Clear stored reference if it matches
        if (this.currentClickHandler === callback) {
            this.currentClickHandler = null;
        }
    }

    /**
     * Clears all click handlers
     * @param {Object} map - Map instance
     */
    clearAllClickHandlers(map) {
        console.log('Clearing all click handlers');
        if (this.currentClickHandler && map) {
            this.removeLocationClickHandler(map, this.currentClickHandler);
        }
    }

    /**
     * Displays bus stops with smart filtering based on zoom and viewport
     * @param {Object} map - Map instance
     * @param {Array} stops - Array of bus stops
     * @param {Object} options - Display options
     */
    displayBusStops(map, stops, options = {}) {
        console.log('=== DisplayBusStops called ===');
        console.log(`Total stops provided: ${stops?.length || 0}`);

        // Store all stops for filtering
        this.allStops = stops || [];

        // Update current map state
        this.currentZoom = this.mapBoxFacade.getZoom(map);
        this.currentBounds = map.getBounds();

        console.log(`Current zoom: ${this.currentZoom}, bounds available: ${!!this.currentBounds}`);

        // Force clear any existing markers first
        this.clearStopMarkers();

        // Initial display with filtering
        this.updateVisibleStops(map, options);
    }

    /**
     * Updates visible stops based on current zoom and viewport
     * @param {Object} map - Map instance
     * @param {Object} options - Display options
     */
    updateVisibleStops(map, options = {}) {
        if (this.isUpdatingStops || !this.allStops.length) return;

        this.isUpdatingStops = true;

        try {
            console.log('=== Updating visible stops ===');

            // Get current zoom configuration
            const zoomLevel = Math.floor(this.currentZoom);
            const config = this.getZoomConfig(zoomLevel);

            console.log(`Zoom: ${this.currentZoom.toFixed(1)}, Config: max=${config.maxStops}, major=${config.showOnlyMajor}`);

            // IMPORTANT: Clear existing markers FIRST
            console.log(`Clearing ${this.stopMarkers.size} existing markers`);
            this.clearStopMarkers();

            // Filter stops based on viewport and zoom
            const filteredStops = this.filterStopsForDisplay(config);

            // Display filtered stops
            this.displayFilteredStops(map, filteredStops, options, config);

            console.log('=== Stop update complete ===');

        } finally {
            this.isUpdatingStops = false;
        }
    }

    /**
     * Gets zoom configuration for current zoom level
     * @param {number} zoomLevel - Current zoom level
     * @returns {Object} - Zoom configuration
     */
    getZoomConfig(zoomLevel) {
        // Find the appropriate zoom level configuration
        const availableZooms = Object.keys(this.zoomConfig).map(Number).sort((a, b) => a - b);

        // Find the highest zoom level that's still <= current zoom
        let targetZoom = availableZooms[0]; // Default to lowest zoom config

        for (let zoom of availableZooms) {
            if (zoomLevel >= zoom) {
                targetZoom = zoom;
            }
        }

        return this.zoomConfig[targetZoom];
    }

    /**
     * Filters stops based on viewport bounds and zoom-based density
     * @param {Object} config - Zoom configuration
     * @returns {Array} - Filtered stops
     */
    filterStopsForDisplay(config) {
        if (!this.currentBounds) {
            // If no bounds, apply zoom-based filtering to all stops
            let allStops = this.allStops;
            if (config.showOnlyMajor) {
                allStops = this.filterMajorStops(allStops);
            }
            return allStops.slice(0, config.maxStops);
        }

        // First filter: only stops within current viewport (with small buffer for smooth transitions)
        const buffer = 0.001; // Small buffer to prevent stops disappearing at edges
        const viewportStops = this.allStops.filter(stop => {
            const lng = stop.pointX;
            const lat = stop.pointY;

            return lng >= (this.currentBounds.getWest() - buffer) &&
                lng <= (this.currentBounds.getEast() + buffer) &&
                lat >= (this.currentBounds.getSouth() - buffer) &&
                lat <= (this.currentBounds.getNorth() + buffer);
        });

        console.log(`Viewport filter: ${viewportStops.length}/${this.allStops.length} stops in bounds`);

        // Second filter: apply zoom-based importance filtering
        let importanceFilteredStops = viewportStops;
        if (config.showOnlyMajor) {
            importanceFilteredStops = this.filterMajorStops(viewportStops);
            console.log(`Major stops filter: ${importanceFilteredStops.length}/${viewportStops.length} major stops`);
        }

        // Third filter: apply grid-based density filtering
        const densityFilteredStops = this.applyDensityFilter(importanceFilteredStops, config);
        console.log(`Density filter: ${densityFilteredStops.length}/${importanceFilteredStops.length} after grid filtering`);

        // Fourth filter: limit total count based on zoom
        const finalStops = densityFilteredStops.slice(0, config.maxStops);
        console.log(`Final filter: ${finalStops.length} stops (max: ${config.maxStops})`);

        return finalStops;
    }

    /**
     * Filters to show only major/important stops when zoomed out
     * @param {Array} stops - Input stops
     * @returns {Array} - Major stops only
     */
    filterMajorStops(stops) {
        const majorStops = stops.filter(stop => {
            // Priority 1: Highlighted stops (part of current route) always show
            if (this.isStopHighlighted(stop)) {
                return true;
            }

            // Priority 2: Stations (isStation: true from database)
            if (stop.isStation === true) {
                return true;
            }

            // Priority 3: Major landmarks based on name (as fallback)
            const name = (stop.name || '').toLowerCase();
            if (name.includes('bến xe') ||      // Bus terminals
                name.includes('ga') ||          // Train stations
                name.includes('sân bay') ||     // Airports
                name.includes('bệnh viện') ||   // Hospitals
                name.includes('đại học') ||     // Universities
                name.includes('trường') ||      // Schools
                name.includes('chợ') ||         // Markets
                name.includes('trung tâm')) {   // Centers
                return true;
            }

            return false;
        });

        console.log(`Major stops identified: ${majorStops.length}/${stops.length} (${majorStops.filter(s => s.isStation).length} stations)`);
        return majorStops;
    }

    /**
     * Applies grid-based density filtering to prevent overcrowding
     * @param {Array} stops - Stops within viewport
     * @param {Object} config - Zoom configuration
     * @returns {Array} - Density-filtered stops
     */
    applyDensityFilter(stops, config) {
        const gridSize = config.gridSize;
        const grid = new Map();
        const prioritizedStops = [];

        // Sort stops by priority (highlighted stops first, then by importance)
        const sortedStops = stops.sort((a, b) => {
            // Prioritize highlighted stops
            const aHighlighted = this.isStopHighlighted(a);
            const bHighlighted = this.isStopHighlighted(b);

            if (aHighlighted && !bHighlighted) return -1;
            if (!aHighlighted && bHighlighted) return 1;

            // Then prioritize by stop importance (could be based on transfer count, etc.)
            return (b.importance || 0) - (a.importance || 0);
        });

        for (let stop of sortedStops) {
            const gridX = Math.floor(stop.pointX / gridSize);
            const gridY = Math.floor(stop.pointY / gridSize);
            const gridKey = `${gridX},${gridY}`;

            // If this grid cell is empty or this stop is highlighted, add it
            if (!grid.has(gridKey) || this.isStopHighlighted(stop)) {
                grid.set(gridKey, stop);
                prioritizedStops.push(stop);
            }
        }

        return prioritizedStops;
    }

    /**
     * Checks if a stop should be highlighted (part of current route)
     * @param {Object} stop - Bus stop object
     * @returns {boolean} - Whether stop is highlighted
     */
    isStopHighlighted(stop) {
        // This would be set by the current route/path
        return stop.isHighlighted || false;
    }

    /**
     * Displays the filtered stops on the map
     * @param {Object} map - Map instance
     * @param {Array} filteredStops - Filtered stops to display
     * @param {Object} options - Display options
     * @param {Object} config - Zoom configuration
     */
    displayFilteredStops(map, filteredStops, options = {}, config = null) {
        const stopsInPath = options.highlightStops || new Set();

        filteredStops.forEach((stop) => {
            const isHighlighted = stopsInPath.has(stop.id);
            stop.isHighlighted = isHighlighted; // Store for filtering priority

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

        // Enhanced logging with config info
        const configInfo = config ?
            `(${config.showOnlyMajor ? 'major stops only' : 'all stops'})` :
            '';

        console.log(`Displaying ${filteredStops.length}/${this.allStops.length} stops at zoom ${this.currentZoom.toFixed(1)} ${configInfo}`);
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
     * Displays a navigation path with multiple segments
     * Enhanced to handle different colors for different segment types
     * @param {Object} map - Map instance
     * @param {Array} pathSegments - Array of path segments (transformed format)
     */
    async displayNavigationPath(map, pathSegments) {
        await this.mapBoxFacade.waitForStyleLoad(map);

        // Clear existing paths
        this.clearRoute(map);

        console.log('MapDisplayService received path segments:', pathSegments);

        const allCoordinates = [];

        // Process each segment with appropriate colors
        for (let i = 0; i < pathSegments.length; i++) {
            const segment = pathSegments[i];
            const segmentId = `path-${segment.type}-${i}`;

            // Handle both 'coords' (transformed) and 'coordinates' (original) properties
            const segmentCoords = segment.coords || segment.coordinates || [];

            if (segmentCoords && segmentCoords.length > 0) {
                allCoordinates.push(...segmentCoords);

                // Get color based on segment type
                const segmentColor = this.getSegmentColor(segment.type);
                const segmentWidth = this.getSegmentWidth(segment.type);

                // Add main path with type-specific styling
                this.mapBoxFacade.addRouteLayer(map, {
                    id: segmentId,
                    coordinates: segmentCoords,
                    color: segmentColor,
                    width: segmentWidth
                });

                // Add arrows for direction with matching color
                this.addRouteArrows(map, `arrow-${segment.type}-${i}`, segmentCoords, segmentColor);
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
     * Gets the appropriate color for a segment type
     * @param {string} segmentType - Type of segment ('walking', 'bus', etc.)
     * @returns {string} - Hex color code
     */
    getSegmentColor(segmentType) {
        return this.segmentColors[segmentType] || this.segmentColors.bus;
    }

    /**
     * Gets the appropriate line width for a segment type
     * @param {string} segmentType - Type of segment
     * @returns {number} - Line width in pixels
     */
    getSegmentWidth(segmentType) {
        switch (segmentType) {
            case 'walking':
                return 3;
            case 'bus':
                return 4;
            case 'transfer':
                return 2;
            default:
                return 4;
        }
    }

    /**
     * Adds directional arrows to a route
     * @param {Object} map - Map instance
     * @param {string} id - Layer ID for arrows
     * @param {Array} coordinates - Route coordinates
     * @param {string} color - Arrow color (optional)
     */
    addRouteArrows(map, id, coordinates, color = null) {
        const arrows = this.createArrowPoints(coordinates);
        const arrowColor = color || this.themeColor;

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
                "line-color": arrowColor,
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
        // Remove markers from MapBox
        this.stopMarkers.forEach((marker, id) => {
            try {
                marker.remove();
            } catch (error) {
                console.warn(`Failed to remove marker ${id}:`, error);
            }
        });

        // Clear the markers map
        this.stopMarkers.clear();

        // Also clear via MapBoxFacade for any remaining references
        try {
            this.mapBoxFacade.clearAllMarkers();
        } catch (error) {
            console.warn('Failed to clear markers via facade:', error);
        }

        console.log('All stop markers cleared');
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
     * Forces an immediate update of visible stops (useful after route changes)
     * @param {Object} map - Map instance
     */
    forceStopUpdate(map) {
        this.isUpdatingStops = false;
        this.updateVisibleStops(map);
    }

    /**
     * Gets current stop display statistics
     * @returns {Object} - Display statistics
     */
    getDisplayStats() {
        return {
            totalStops: this.allStops.length,
            displayedStops: this.stopMarkers.size,
            currentZoom: this.currentZoom,
            hasValidBounds: !!this.currentBounds
        };
    }

    /**
     * Cleans up map resources
     * @param {Object} map - Map instance
     */
    cleanup(map) {
        this.clearRoute(map);
        this.clearStopMarkers();
        this.clearAllClickHandlers(map);
        this.allStops = [];
        this.currentBounds = null;
        this.activeMap = null;
    }
}

// Export singleton instance
const mapDisplayService = new MapDisplayService();
export default mapDisplayService;