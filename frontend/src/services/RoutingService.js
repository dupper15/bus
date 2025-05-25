import mapBoxFacade from "./MapBoxFacade.js";
import Route from '@/components/Route/Route.jsx';
import WalkingSegment from '@/components/Route/WalkingSegment.jsx';
import BusSegment from '@/components/Route/BusSegment.jsx';
import RouteComponent from '@/components/Route/RouteComponent.jsx';

/**
 * RoutingService - Enhanced to work with Composite pattern
 * Handles all route-related operations and creates Route composite objects
 */
class RoutingService {
    constructor() {
        this.mapBoxFacade = mapBoxFacade;
    }

    /**
     * Creates a complete Route object with all segments
     * Enhanced to use Composite pattern
     * @param {Array} startCoords - Starting [lng, lat] coordinates
     * @param {Array} endCoords - Ending [lng, lat] coordinates
     * @param {Array} pathData - Path data from pathfinding strategy
     * @param {Object} options - Route creation options
     * @returns {Promise<Route>} - Complete Route composite object
     */
    async createRoute(startCoords, endCoords, pathData, options = {}) {
        try {
            const components = [];
            const routeName = options.name || `Route ${new Date().toLocaleTimeString()}`;
            const strategy = options.strategy || 'balanced';

            // Process path data to create route components
            if (pathData && pathData.segments && Array.isArray(pathData.segments)) {
                for (let i = 0; i < pathData.segments.length; i++) {
                    const segmentData = pathData.segments[i];
                    const component = await this.createRouteComponent(segmentData, i, options);

                    if (component && component.isValid()) {
                        components.push(component);
                    }
                }
            }

            // Create the composite Route object
            const route = new Route({
                name: routeName,
                components: components,
                strategy: strategy,
                metadata: {
                    ...options.metadata,
                    createdBy: 'RoutingService',
                    pathData: pathData,
                    startCoords: startCoords,
                    endCoords: endCoords
                },
                confidence: this.calculateRouteConfidence(components),
                realTimeUpdates: options.realTimeUpdates || false
            });

            // Validate the complete route
            if (!route.isValid()) {
                console.warn('Created route is not valid:', route);
            }

            return route;
        } catch (error) {
            console.error('Error creating route:', error);
            return new Route({
                name: 'Error Route',
                metadata: { error: error.message }
            });
        }
    }

    /**
     * Creates individual route components (segments)
     * @param {Object} segmentData - Segment data from pathfinding
     * @param {number} index - Segment index
     * @param {Object} options - Creation options
     * @returns {Promise<RouteComponent>} - Route component
     */
    async createRouteComponent(segmentData, index, options = {}) {
        try {
            if (segmentData.type === 'walking') {
                return await this.createWalkingSegment(segmentData, options);
            } else if (segmentData.type === 'bus') {
                return await this.createBusSegment(segmentData, options);
            } else {
                console.warn(`Unknown segment type: ${segmentData.type}`);
                return null;
            }
        } catch (error) {
            console.error(`Error creating route component ${index}:`, error);
            return null;
        }
    }

    /**
     * Creates a WalkingSegment with enhanced route data
     * @param {Object} segmentData - Walking segment data
     * @param {Object} options - Creation options
     * @returns {Promise<WalkingSegment>} - Walking segment component
     */
    async createWalkingSegment(segmentData, options = {}) {
        const startPoint = segmentData.from || segmentData.startPoint;
        const endPoint = segmentData.to || segmentData.endPoint;

        // Get enhanced walking route data from MapBox
        let walkingRoute = null;
        let coordinates = segmentData.coordinates || [];
        let distance = segmentData.distance || 0;
        let duration = segmentData.duration || 0;

        try {
            const startCoords = this.extractCoordinates(startPoint);
            const endCoords = this.extractCoordinates(endPoint);

            if (startCoords && endCoords) {
                walkingRoute = await this.getWalkingRoute(startCoords, endCoords);

                if (walkingRoute) {
                    coordinates = walkingRoute.coordinates || coordinates;
                    distance = walkingRoute.distance || distance;
                    duration = walkingRoute.duration || duration;
                }
            }
        } catch (error) {
            console.warn('Could not get enhanced walking route data:', error);
        }

        return new WalkingSegment({
            distance: distance,
            duration: duration,
            startPoint: startPoint,
            endPoint: endPoint,
            coordinates: coordinates,
            path: walkingRoute?.coordinates || [],
            terrain: this.assessTerrain(coordinates),
            sidewalkAvailable: options.sidewalkAvailable !== false,
            accessibilityFeatures: this.assessAccessibility(coordinates, options)
        });
    }

    /**
     * Creates a BusSegment with enhanced route data
     * @param {Object} segmentData - Bus segment data
     * @param {Object} options - Creation options
     * @returns {Promise<BusSegment>} - Bus segment component
     */
    async createBusSegment(segmentData, options = {}) {
        const startPoint = segmentData.from || segmentData.startPoint;
        const endPoint = segmentData.to || segmentData.endPoint;
        const intermediateStops = segmentData.intermediateStops || segmentData.stops || [];

        // Get enhanced bus route data
        let busRoute = null;
        let coordinates = segmentData.coordinates || [];
        let distance = segmentData.distance || 0;
        let duration = segmentData.duration || 0;

        try {
            // Create complete stop sequence
            const allStops = [startPoint, ...intermediateStops, endPoint].filter(Boolean);
            busRoute = await this.getBusRoute(allStops);

            if (busRoute) {
                coordinates = busRoute.coordinates || coordinates;
                distance = busRoute.distance || distance;
                duration = busRoute.duration || duration;
            }
        } catch (error) {
            console.warn('Could not get enhanced bus route data:', error);
        }

        return new BusSegment({
            distance: distance,
            duration: duration,
            startPoint: startPoint,
            endPoint: endPoint,
            coordinates: coordinates,
            busLine: segmentData.line || segmentData.busLine,
            fare: segmentData.fare || this.calculateBusFare(distance),
            intermediateStops: intermediateStops,
            schedule: options.includeSchedule ? this.getBusSchedule(segmentData.line) : null,
            vehicleType: this.determineBusType(segmentData.line),
            accessibility: this.assessBusAccessibility(segmentData.line)
        });
    }

    /**
     * Finds the best route between start and end coordinates
     * Enhanced to return Route composite object
     * @param {Array} startCoords - Starting [lng, lat] coordinates
     * @param {Array} endCoords - Ending [lng, lat] coordinates
     * @param {Array} busStops - Available bus stops
     * @param {Array} busLines - Available bus lines
     * @param {Object} options - Routing options
     * @returns {Promise<Route>} - Route composite object
     */
    async findBestRoute(startCoords, endCoords, busStops, busLines, options = {}) {
        try {
            // This method now primarily delegates to strategy pattern
            // but can provide basic routing as fallback

            const basicPath = await this.createBasicRoute(startCoords, endCoords, busStops, busLines, options);
            return await this.createRoute(startCoords, endCoords, basicPath, options);
        } catch (error) {
            console.error('Error finding best route:', error);
            return new Route({
                name: 'Error Route',
                metadata: { error: error.message }
            });
        }
    }

    /**
     * Creates a basic route when strategy pattern is not available
     * @param {Array} startCoords - Starting coordinates
     * @param {Array} endCoords - Ending coordinates
     * @param {Array} busStops - Available bus stops
     * @param {Array} busLines - Available bus lines
     * @param {Object} options - Routing options
     * @returns {Promise<Object>} - Basic path data
     */
    async createBasicRoute(startCoords, endCoords, busStops, busLines, options = {}) {
        // Find nearest stops
        const nearbyStartStops = this.findNearestStops(startCoords, busStops, 1);
        const nearbyEndStops = this.findNearestStops(endCoords, busStops, 1);

        if (nearbyStartStops.length === 0 || nearbyEndStops.length === 0) {
            // Walking-only route
            return {
                segments: [{
                    type: 'walking',
                    from: { name: 'Start', coordinates: startCoords },
                    to: { name: 'End', coordinates: endCoords },
                    distance: this.calculateDistance(startCoords, endCoords),
                    duration: this.estimateTravelTime(this.calculateDistance(startCoords, endCoords), 'walking')
                }],
                totalDistance: this.calculateDistance(startCoords, endCoords),
                totalDuration: this.estimateTravelTime(this.calculateDistance(startCoords, endCoords), 'walking')
            };
        }

        // Simple route: walk to nearest stop, take bus, walk to destination
        const startStop = nearbyStartStops[0].stop;
        const endStop = nearbyEndStops[0].stop;

        return {
            segments: [
                {
                    type: 'walking',
                    from: { name: 'Start', coordinates: startCoords },
                    to: startStop,
                    distance: nearbyStartStops[0].distance,
                    duration: this.estimateTravelTime(nearbyStartStops[0].distance, 'walking')
                },
                {
                    type: 'bus',
                    from: startStop,
                    to: endStop,
                    line: this.findBusLineConnecting(startStop, endStop, busLines),
                    distance: this.calculateDistance([startStop.pointX, startStop.pointY], [endStop.pointX, endStop.pointY]),
                    duration: this.estimateTravelTime(this.calculateDistance([startStop.pointX, startStop.pointY], [endStop.pointX, endStop.pointY]), 'bus')
                },
                {
                    type: 'walking',
                    from: endStop,
                    to: { name: 'End', coordinates: endCoords },
                    distance: nearbyEndStops[0].distance,
                    duration: this.estimateTravelTime(nearbyEndStops[0].distance, 'walking')
                }
            ]
        };
    }

    /**
     * Calculates route confidence based on components
     * @param {Array} components - Route components
     * @returns {number} - Confidence score (0.0 to 1.0)
     */
    calculateRouteConfidence(components) {
        if (!components || components.length === 0) return 0.0;

        let totalConfidence = 0;
        let validComponents = 0;

        components.forEach(component => {
            if (component.isValid()) {
                validComponents++;

                // Base confidence for valid components
                let componentConfidence = 0.8;

                // Bonus for bus segments (more predictable)
                if (component instanceof BusSegment) {
                    componentConfidence += 0.1;
                }

                // Penalty for long walking segments
                if (component instanceof WalkingSegment && component.getDistance() > 2) {
                    componentConfidence -= 0.2;
                }

                totalConfidence += Math.max(0, Math.min(1, componentConfidence));
            }
        });

        return validComponents > 0 ? totalConfidence / validComponents : 0.0;
    }

    /**
     * Assesses terrain type based on coordinates
     * @param {Array} coordinates - Route coordinates
     * @returns {string} - Terrain type
     */
    assessTerrain(coordinates) {
        // Simple heuristic - in real implementation would use elevation data
        if (!coordinates || coordinates.length < 2) return 'flat';

        // For now, return flat - could be enhanced with real terrain analysis
        return 'flat';
    }

    /**
     * Assesses accessibility features for walking routes
     * @param {Array} coordinates - Route coordinates
     * @param {Object} options - Assessment options
     * @returns {Array} - Array of accessibility features
     */
    assessAccessibility(coordinates, options = {}) {
        const features = [];

        // In real implementation, would analyze route for:
        // - Sidewalk availability
        // - Curb cuts
        // - Traffic light accessibility
        // - Surface quality

        if (options.requireAccessible) {
            features.push('wheelchair accessible');
        }

        return features;
    }

    /**
     * Calculates bus fare based on distance or other factors
     * @param {number} distance - Distance in km
     * @returns {number} - Fare in VND
     */
    calculateBusFare(distance) {
        // Simple flat fare for now - could be enhanced with zone-based pricing
        return 6000;
    }

    /**
     * Gets bus schedule information (mock implementation)
     * @param {Object} busLine - Bus line object
     * @returns {Object} - Schedule information
     */
    getBusSchedule(busLine) {
        // Mock implementation - real version would query schedule API
        return {
            frequency: '10-15 minutes',
            operatingHours: '5:00 AM - 11:00 PM',
            nextBuses: [5, 12, 27] // Minutes until next buses
        };
    }

    /**
     * Determines bus vehicle type
     * @param {Object} busLine - Bus line object
     * @returns {string} - Vehicle type
     */
    determineBusType(busLine) {
        if (!busLine || !busLine.name) return 'standard';

        // Simple heuristic based on line name
        if (busLine.name.includes('Express') || busLine.name.includes('BRT')) {
            return 'express';
        }

        return 'standard';
    }

    /**
     * Assesses bus accessibility features
     * @param {Object} busLine - Bus line object
     * @returns {Array} - Array of accessibility features
     */
    assessBusAccessibility(busLine) {
        const features = [];

        // Assume most buses have basic accessibility
        features.push('wheelchair accessible', 'low floor');

        // Enhanced features for newer lines
        if (busLine && busLine.name && busLine.name.includes('BRT')) {
            features.push('level boarding', 'audio announcements');
        }

        return features;
    }

    /**
     * Finds bus line connecting two stops
     * @param {Object} startStop - Starting bus stop
     * @param {Object} endStop - Ending bus stop
     * @param {Array} busLines - Available bus lines
     * @returns {Object} - Bus line object
     */
    findBusLineConnecting(startStop, endStop, busLines) {
        // Simple implementation - find first line that serves both stops
        for (let line of busLines) {
            if (line.arr_stop && Array.isArray(line.arr_stop)) {
                const hasStartStop = line.arr_stop.some(stop =>
                    stop.id === startStop.id || stop.name === startStop.name
                );
                const hasEndStop = line.arr_stop.some(stop =>
                    stop.id === endStop.id || stop.name === endStop.name
                );

                if (hasStartStop && hasEndStop) {
                    return line;
                }
            }
        }

        // Fallback - return a generic line
        return { name: 'Bus Line', id: 'generic' };
    }

    /**
     * Calculates the nearest stops to given coordinates
     * @param {Array} coordinates - [lng, lat] coordinates
     * @param {Array} busStops - Array of bus stops
     * @param {number} maxDistance - Maximum distance in km
     * @returns {Array} - Array of nearby stops with distances
     */
    findNearestStops(coordinates, busStops, maxDistance = 1) {
        const nearbyStops = [];
        const searchCoords = RouteComponent.ensureLngLat(coordinates);

        if (!searchCoords) return nearbyStops;

        busStops.forEach((stop) => {
            const stopCoords = this.extractCoordinates(stop);
            if (stopCoords) {
                const distance = this.calculateDistance(searchCoords, stopCoords);
                if (distance <= maxDistance) {
                    nearbyStops.push({ stop, distance });
                }
            }
        });

        return nearbyStops.sort((a, b) => a.distance - b.distance);
    }

    /**
     * Calculates the distance between two coordinates in km
     * @param {Array} coord1 - First [lng, lat] coordinate
     * @param {Array} coord2 - Second [lng, lat] coordinate
     * @returns {number} - Distance in kilometers
     */
    calculateDistance(coord1, coord2) {
        // Ensure coordinates are in correct format
        const c1 = RouteComponent.ensureLngLat(coord1);
        const c2 = RouteComponent.ensureLngLat(coord2);

        if (!c1 || !c2) return 0;

        const [lng1, lat1] = c1;
        const [lng2, lat2] = c2;

        // Haversine formula for more accurate distance calculation
        const R = 6371; // Earth's radius in km
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Converts degrees to radians
     * @param {number} degrees - Degrees value
     * @returns {number} - Radians value
     */
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Gets walking directions between two points
     * @param {Array} startCoords - Starting coordinates [lng, lat]
     * @param {Array} endCoords - Ending coordinates [lng, lat]
     * @returns {Promise<Object>} - Walking route data
     */
    async getWalkingRoute(startCoords, endCoords) {
        try {
            // Ensure coordinates are in correct format
            const start = Array.isArray(startCoords) ? startCoords : [startCoords.lng || startCoords[1], startCoords.lat || startCoords[0]];
            const end = Array.isArray(endCoords) ? endCoords : [endCoords.lng || endCoords[1], endCoords.lat || endCoords[0]];

            const directionsData = await this.mapBoxFacade.getDirections(
                [start, end],
                'walking'
            );

            if (directionsData.routes && directionsData.routes.length > 0) {
                const route = directionsData.routes[0];
                return {
                    coordinates: route.geometry.coordinates,
                    distance: route.distance / 1000, // Convert to km
                    duration: route.duration / 60 // Convert to minutes
                };
            }
        } catch (error) {
            console.error('Error getting walking route:', error);
        }

        // Fallback to straight-line calculation
        const distance = this.calculateDistance(startCoords, endCoords);
        return {
            coordinates: [startCoords, endCoords],
            distance: distance,
            duration: distance / 5 * 60 // Assume 5 km/h walking speed
        };
    }

    /**
     * Gets bus route between stops
     * @param {Array} stops - Array of bus stops
     * @returns {Promise<Object>} - Bus route data
     */
    async getBusRoute(stops) {
        try {
            const coordinates = stops.map(stop => {
                const coords = this.extractCoordinates(stop);
                return RouteComponent.ensureLngLat(coords);
            }).filter(coords => coords !== null);

            console.log('Bus route coordinates:', coordinates); // Debug log

            const directionsData = await this.mapBoxFacade.getDirections(coordinates, 'driving');

            if (directionsData.routes && directionsData.routes.length > 0) {
                const route = directionsData.routes[0];
                return {
                    coordinates: route.geometry.coordinates,
                    distance: route.distance / 1000, // Convert to km
                    duration: route.duration / 60 // Convert to minutes
                };
            }
        } catch (error) {
            console.error('Error getting bus route:', error);
        }

        return null;
    }

    /**
     * Extracts coordinates from various location formats and ensures [lng, lat] format
     * @param {Object|Array} location - Location object or coordinates
     * @returns {Array|null} - [lng, lat] coordinates
     */
    extractCoordinates(location) {
        if (!location) return null;

        let coords = null;

        // Array format - could be [lng, lat] or [lat, lng]
        if (Array.isArray(location) && location.length >= 2) {
            coords = [location[0], location[1]];
        }
        // Object with pointX, pointY (bus stop format) - already in [lng, lat]
        else if (location.pointX !== undefined && location.pointY !== undefined) {
            coords = [location.pointX, location.pointY];
        }
        // Object with lng, lat - already in [lng, lat]
        else if (location.lng !== undefined && location.lat !== undefined) {
            coords = [location.lng, location.lat];
        }
        // Object with longitude, latitude - already in [lng, lat]
        else if (location.longitude !== undefined && location.latitude !== undefined) {
            coords = [location.longitude, location.latitude];
        }
        // Object with coordinates array
        else if (location.coordinates && Array.isArray(location.coordinates)) {
            coords = this.extractCoordinates(location.coordinates);
        }

        // Ensure coordinates are in [lng, lat] format and validate
        if (coords) {
            const standardized = RouteComponent.ensureLngLat(coords);
            return RouteComponent.validateCoordinates(standardized) ? standardized : null;
        }

        return null;
    }

    /**
     * Estimates travel time for different transportation modes
     * @param {number} distance - Distance in km
     * @param {string} mode - Transportation mode ('walking', 'bus')
     * @returns {number} - Estimated time in minutes
     */
    estimateTravelTime(distance, mode = 'walking') {
        const speeds = {
            walking: 5, // km/h
            bus: 20,    // km/h
            transfer: 5 // minutes per transfer
        };

        if (mode === 'transfer') {
            return speeds.transfer;
        }

        return (distance / speeds[mode]) * 60; // Convert to minutes
    }

    /**
     * Gets route summary statistics from Route object
     * @param {Route} route - Route composite object
     * @returns {Object} - Route statistics
     */
    getRouteSummary(route) {
        if (!(route instanceof Route)) {
            return null;
        }

        return route.getSummary();
    }

    /**
     * Validates Route object
     * @param {Route} route - Route object to validate
     * @param {Object} constraints - Validation constraints
     * @returns {boolean} - Whether the route is valid
     */
    validateRoute(route, constraints = {}) {
        if (!(route instanceof Route)) {
            return false;
        }

        return route.isValid();
    }
}

// Export singleton instance
const routingService = new RoutingService();
export default routingService;