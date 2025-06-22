import mapBoxFacade from "@/services/MapBoxFacade.js";

class MapDisplayService {
    constructor() {
        this.mapBoxFacade = mapBoxFacade;
        this.themeColor = "#22C55E";
        this.highlightColor = "#16A34A";

        this.segmentColors = {
            walking: "#3B82F6",
            bus: "#22C55E",
            transfer: "#F59E0B"
        };

        this.stopMarkers = new Map();
        this.allStops = [];
        this.currentZoom = 13;
        this.currentBounds = null;
        this.isUpdatingStops = false;

        this.currentClickHandler = null;
        this.activeMap = null;

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

    initializeMap(container, options = {}) {
        const map = this.mapBoxFacade.createMap(container, options);
        this.mapBoxFacade.addNavigationControls(map);
        this.activeMap = map;

        this.setupStopFiltering(map);

        return map;
    }

    setupStopFiltering(map) {
        let updateTimeout;
        const debouncedUpdate = () => {
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => {
                this.updateVisibleStops(map);
            }, 150);
        };

        map.on('zoom', () => {
            this.currentZoom = this.mapBoxFacade.getZoom(map);
            debouncedUpdate();
        });

        map.on('moveend', () => {
            this.currentBounds = map.getBounds();
            debouncedUpdate();
        });

        map.on('load', () => {
            this.currentZoom = this.mapBoxFacade.getZoom(map);
            this.currentBounds = map.getBounds();
            if (this.allStops.length > 0) {
                this.updateVisibleStops(map);
            }
        });
    }

    setLocationClickHandler(map, callback) {

        if (this.currentClickHandler && this.activeMap) {
            this.removeLocationClickHandler(this.activeMap, this.currentClickHandler);
        }

        if (callback && typeof callback === 'function') {
            const wrappedHandler = (e) => {
                const coordinates = [e.lngLat.lng, e.lngLat.lat];

                if (Array.isArray(coordinates) && coordinates.length === 2 &&
                    typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
                    callback(coordinates);
                } else {
                    console.error('Invalid coordinates extracted from MapBox event:', coordinates);
                }
            };

            this.currentClickHandler = wrappedHandler;
            this.activeMap = map;

            map.on("click", wrappedHandler);
        } else {
            this.currentClickHandler = null;
        }
    }

    removeLocationClickHandler(map, callback) {

        if (callback && map) {
            try {
                map.off("click", callback);
            } catch (error) {
                console.warn('Error removing click handler:', error);
            }
        }

        if (this.currentClickHandler === callback) {
            this.currentClickHandler = null;
        }
    }

    clearAllClickHandlers(map) {
        if (this.currentClickHandler && map) {
            this.removeLocationClickHandler(map, this.currentClickHandler);
        }
    }

    displayBusStops(map, stops, options = {}) {

        this.allStops = stops || [];

        this.currentZoom = this.mapBoxFacade.getZoom(map);
        this.currentBounds = map.getBounds();

        this.clearStopMarkers();

        this.updateVisibleStops(map, options);
    }

    updateVisibleStops(map, options = {}) {
        if (this.isUpdatingStops || !this.allStops.length) return;

        this.isUpdatingStops = true;

        try {

            const zoomLevel = Math.floor(this.currentZoom);
            const config = this.getZoomConfig(zoomLevel);

            this.clearStopMarkers();

            const filteredStops = this.filterStopsForDisplay(config);

            this.displayFilteredStops(map, filteredStops, options, config);

        } finally {
            this.isUpdatingStops = false;
        }
    }

    getZoomConfig(zoomLevel) {
        const availableZooms = Object.keys(this.zoomConfig).map(Number).sort((a, b) => a - b);

        let targetZoom = availableZooms[0];

        for (let zoom of availableZooms) {
            if (zoomLevel >= zoom) {
                targetZoom = zoom;
            }
        }

        return this.zoomConfig[targetZoom];
    }

    filterStopsForDisplay(config) {
        if (!this.currentBounds) {
            let allStops = this.allStops;
            if (config.showOnlyMajor) {
                allStops = this.filterMajorStops(allStops);
            }
            return allStops.slice(0, config.maxStops);
        }

        const buffer = 0.001;
        const viewportStops = this.allStops.filter(stop => {
            const lng = stop.pointX;
            const lat = stop.pointY;

            return lng >= (this.currentBounds.getWest() - buffer) &&
                lng <= (this.currentBounds.getEast() + buffer) &&
                lat >= (this.currentBounds.getSouth() - buffer) &&
                lat <= (this.currentBounds.getNorth() + buffer);
        });

        let importanceFilteredStops = viewportStops;
        if (config.showOnlyMajor) {
            importanceFilteredStops = this.filterMajorStops(viewportStops);
        }

        const densityFilteredStops = this.applyDensityFilter(importanceFilteredStops, config);

        const finalStops = densityFilteredStops.slice(0, config.maxStops);

        return finalStops;
    }

    filterMajorStops(stops) {
        const majorStops = stops.filter(stop => {
            if (this.isStopHighlighted(stop)) {
                return true;
            }

            if (stop.isStation === true) {
                return true;
            }

            const name = (stop.name || '').toLowerCase();
            if (name.includes('bến xe') ||
                name.includes('ga') ||
                name.includes('sân bay') ||
                name.includes('bệnh viện') ||
                name.includes('đại học') ||
                name.includes('trường') ||
                name.includes('chợ') ||
                name.includes('trung tâm')) {
                return true;
            }

            return false;
        });

        return majorStops;
    }

    applyDensityFilter(stops, config) {
        const gridSize = config.gridSize;
        const grid = new Map();
        const prioritizedStops = [];

        const sortedStops = stops.sort((a, b) => {
            const aHighlighted = this.isStopHighlighted(a);
            const bHighlighted = this.isStopHighlighted(b);

            if (aHighlighted && !bHighlighted) return -1;
            if (!aHighlighted && bHighlighted) return 1;

            return (b.importance || 0) - (a.importance || 0);
        });

        for (let stop of sortedStops) {
            const gridX = Math.floor(stop.pointX / gridSize);
            const gridY = Math.floor(stop.pointY / gridSize);
            const gridKey = `${gridX},${gridY}`;

            if (!grid.has(gridKey) || this.isStopHighlighted(stop)) {
                grid.set(gridKey, stop);
                prioritizedStops.push(stop);
            }
        }

        return prioritizedStops;
    }

    isStopHighlighted(stop) {
        return stop.isHighlighted || false;
    }

    displayFilteredStops(map, filteredStops, options = {}, config = null) {
        const stopsInPath = options.highlightStops || new Set();

        filteredStops.forEach((stop) => {
            const isHighlighted = stopsInPath.has(stop.id);
            stop.isHighlighted = isHighlighted;

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

        const configInfo = config ?
            `(${config.showOnlyMajor ? 'major stops only' : 'all stops'})` :
            '';

    }

    async displayRoute(map, route, options = {}) {
        const { id, coordinates, mode = 'outbound' } = route;
        const routeCoords = mode === 'inbound'
            ? [...coordinates].reverse()
            : coordinates;

        await this.mapBoxFacade.waitForStyleLoad(map);

        this.clearRoute(map);

        this.mapBoxFacade.addRouteLayer(map, {
            id: `line-${id}`,
            coordinates: routeCoords,
            color: options.color || this.themeColor,
            width: options.width || 4
        });

        if (options.showArrows !== false) {
            this.addRouteArrows(map, `arrow-${id}`, routeCoords);
        }
    }

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

    async displayNavigationPath(map, pathSegments) {
        await this.mapBoxFacade.waitForStyleLoad(map);

        this.clearRoute(map);


        const allCoordinates = [];

        for (let i = 0; i < pathSegments.length; i++) {
            const segment = pathSegments[i];
            const segmentId = `path-${segment.type}-${i}`;

            const segmentCoords = segment.coords || segment.coordinates || [];

            if (segmentCoords && segmentCoords.length > 0) {
                allCoordinates.push(...segmentCoords);

                const segmentColor = this.getSegmentColor(segment.type);
                const segmentWidth = this.getSegmentWidth(segment.type);

                this.mapBoxFacade.addRouteLayer(map, {
                    id: segmentId,
                    coordinates: segmentCoords,
                    color: segmentColor,
                    width: segmentWidth
                });

                this.addRouteArrows(map, `arrow-${segment.type}-${i}`, segmentCoords, segmentColor);
            } else {
                console.warn(`Segment ${i} has no coordinates:`, segment);
            }
        }

        if (allCoordinates.length > 0) {
            try {
                const bounds = this.mapBoxFacade.createBounds(allCoordinates);
                this.mapBoxFacade.fitBounds(map, bounds);
            } catch {
                console.warn('No coordinates found in any path segments');
            }
        }
    }

    getSegmentColor(segmentType) {
        return this.segmentColors[segmentType] || this.segmentColors.bus;
    }

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

    clearRoute(map) {
        this.mapBoxFacade.clearRouteLayers(map, "path-");
        this.mapBoxFacade.clearRouteLayers(map, "line-");
        this.mapBoxFacade.clearRouteLayers(map, "arrow-");
    }

    clearStopMarkers() {
        this.stopMarkers.forEach((marker, id) => {
            try {
                marker.remove();
            } catch (error) {
                console.warn(`Failed to remove marker ${id}:`, error);
            }
        });

        this.stopMarkers.clear();

        try {
            this.mapBoxFacade.clearAllMarkers();
        } catch (error) {
            console.warn('Failed to clear markers via facade:', error);
        }
    }

    focusOnLocation(map, coordinates, options = {}) {
        this.mapBoxFacade.flyTo(map, coordinates, options);
    }

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

    forceStopUpdate(map) {
        this.isUpdatingStops = false;
        this.updateVisibleStops(map);
    }

    getDisplayStats() {
        return {
            totalStops: this.allStops.length,
            displayedStops: this.stopMarkers.size,
            currentZoom: this.currentZoom,
            hasValidBounds: !!this.currentBounds
        };
    }

    cleanup(map) {
        this.clearRoute(map);
        this.clearStopMarkers();
        this.clearAllClickHandlers(map);
        this.allStops = [];
        this.currentBounds = null;
        this.activeMap = null;
    }
}

const mapDisplayService = new MapDisplayService();
export default mapDisplayService;