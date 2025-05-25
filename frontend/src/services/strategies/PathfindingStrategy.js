import Route from '@/components/Route/Route.jsx';
import WalkingSegment from '@/components/Route/WalkingSegment.jsx';
import BusSegment from '@/components/Route/BusSegment.jsx';
import RouteComponent from '@/components/Route/RouteComponent.jsx';
import routingService from '@/services/RoutingService.js';

/**
 * PathfindingStrategy - Enhanced base class for Strategy pattern with Composite pattern support
 * Now returns Route composite objects instead of plain segment arrays
 */
class PathfindingStrategy {
    constructor(name, icon = '🔍', description = '') {
        if (this.constructor === PathfindingStrategy) {
            throw new Error("PathfindingStrategy is an abstract class and cannot be instantiated directly");
        }

        this.name = name;
        this.icon = icon;
        this.description = description;
        this.type = this.constructor.name.replace('Strategy', '').toLowerCase();
    }

    /**
     * Abstract method to find path - must be implemented by concrete strategies
     * @param {Array} startCoords - Starting coordinates [lng, lat]
     * @param {Array} endCoords - Ending coordinates [lng, lat]
     * @param {Array} busStops - Available bus stops
     * @param {Array} busLines - Available bus lines
     * @returns {Promise<Object>} - Result object with Route and metadata
     */
    async findPath(startCoords, endCoords, busStops, busLines) {
        throw new Error("findPath() must be implemented by concrete strategy classes");
    }

    /**
     * Creates a Route composite object from path segments
     * @param {Array} segments - Array of route segments
     * @param {Object} metadata - Additional route metadata
     * @returns {Route} - Route composite object
     */
    createRoute(segments, metadata = {}) {
        try {
            const components = segments.map((segment, index) => {
                return this.createRouteComponent(segment, index);
            }).filter(component => component !== null);

            const route = new Route({
                name: `${this.name} Route`,
                components: components,
                strategy: this.type,
                metadata: {
                    ...metadata,
                    strategyUsed: {
                        name: this.name,
                        icon: this.icon,
                        type: this.type,
                        description: this.description
                    },
                    createdAt: new Date().toISOString()
                }
            });

            return route;
        } catch (error) {
            console.error('Error creating route from segments:', error);
            return new Route({
                name: 'Error Route',
                strategy: this.type,
                metadata: { error: error.message }
            });
        }
    }

    /**
     * Creates individual route components from segment data
     * @param {Object} segmentData - Segment data
     * @param {number} index - Segment index
     * @returns {RouteComponent} - Route component (WalkingSegment or BusSegment)
     */
    createRouteComponent(segmentData, index) {
        try {
            if (segmentData.type === 'walking') {
                return new WalkingSegment({
                    distance: segmentData.distance || 0,
                    duration: segmentData.duration || 0,
                    startPoint: segmentData.from,
                    endPoint: segmentData.to,
                    coordinates: segmentData.coordinates || [],
                    terrain: segmentData.terrain || 'flat',
                    sidewalkAvailable: segmentData.sidewalkAvailable !== false,
                    accessibilityFeatures: segmentData.accessibilityFeatures || []
                });
            } else if (segmentData.type === 'bus') {
                return new BusSegment({
                    distance: segmentData.distance || 0,
                    duration: segmentData.duration || 0,
                    startPoint: segmentData.from,
                    endPoint: segmentData.to,
                    coordinates: segmentData.coordinates || [],
                    busLine: segmentData.line,
                    fare: segmentData.fare || 6000,
                    intermediateStops: segmentData.intermediateStops || [],
                    vehicleType: segmentData.vehicleType || 'standard',
                    accessibility: segmentData.accessibility || []
                });
            } else {
                console.warn(`Unknown segment type: ${segmentData.type}`);
                return null;
            }
        } catch (error) {
            console.error(`Error creating component ${index}:`, error);
            return null;
        }
    }

    /**
     * Calculates optimization score for route comparison
     * @param {Route} route - Route to score
     * @param {Object} preferences - User preferences for scoring
     * @returns {number} - Optimization score (lower is better)
     */
    calculateScore(route, preferences = {}) {
        if (!(route instanceof Route)) {
            return Infinity;
        }

        const weights = {
            distance: preferences.distanceWeight || 1.0,
            duration: preferences.durationWeight || 1.5,
            transfers: preferences.transferWeight || 2.0,
            walking: preferences.walkingWeight || 1.5,
            cost: preferences.costWeight || 0.1
        };

        return (
            (route.getDistance() * weights.distance) +
            (route.getDuration() * weights.duration) +
            (route.getTransferCount() * weights.transfers) +
            (route.getWalkingDistance() * weights.walking) +
            (route.getCost() * weights.cost)
        );
    }

    /**
     * Finds nearby stops to a coordinate
     * @param {Array} coordinates - [lng, lat] coordinates
     * @param {Array} busStops - Array of bus stops
     * @param {number} maxDistance - Maximum distance in km
     * @returns {Array} - Array of nearby stops
     */
    findNearbyStops(coordinates, busStops, maxDistance = 1) {
        return routingService.findNearestStops(coordinates, busStops, maxDistance);
    }

    /**
     * Calculates distance between two coordinates
     * @param {Array} coord1 - First coordinate [lng, lat]
     * @param {Array} coord2 - Second coordinate [lng, lat]
     * @returns {number} - Distance in km
     */
    calculateDistance(coord1, coord2) {
        return routingService.calculateDistance(coord1, coord2);
    }

    /**
     * Estimates travel time for different modes
     * @param {number} distance - Distance in km
     * @param {string} mode - Transportation mode
     * @returns {number} - Estimated time in minutes
     */
    estimateTravelTime(distance, mode = 'walking') {
        return routingService.estimateTravelTime(distance, mode);
    }

    /**
     * Finds direct bus connections between stops
     * @param {Object} startStop - Starting bus stop
     * @param {Object} endStop - Ending bus stop
     * @param {Array} busLines - Available bus lines
     * @returns {Array} - Array of connecting bus lines
     */
    findDirectConnections(startStop, endStop, busLines) {
        const connections = [];

        for (let line of busLines) {
            if (line.arr_stop && Array.isArray(line.arr_stop)) {
                const startIndex = line.arr_stop.findIndex(stop =>
                    stop.id === startStop.id || stop.name === startStop.name
                );
                const endIndex = line.arr_stop.findIndex(stop =>
                    stop.id === endStop.id || stop.name === endStop.name
                );

                if (startIndex !== -1 && endIndex !== -1 && startIndex !== endIndex) {
                    // Ensure proper direction (start comes before end in route)
                    if (startIndex < endIndex ||
                        (line.circular && Math.abs(startIndex - endIndex) > line.arr_stop.length / 2)) {
                        connections.push({
                            line: line,
                            startIndex: startIndex,
                            endIndex: endIndex,
                            intermediateStops: this.getIntermediateStops(line.arr_stop, startIndex, endIndex)
                        });
                    }
                }
            }
        }

        return connections;
    }

    /**
     * Gets intermediate stops between two stops on a line
     * @param {Array} allStops - All stops on the line
     * @param {number} startIndex - Start stop index
     * @param {number} endIndex - End stop index
     * @returns {Array} - Intermediate stops
     */
    getIntermediateStops(allStops, startIndex, endIndex) {
        if (startIndex < endIndex) {
            return allStops.slice(startIndex + 1, endIndex);
        } else {
            // Handle circular routes
            return [
                ...allStops.slice(startIndex + 1),
                ...allStops.slice(0, endIndex)
            ];
        }
    }

    /**
     * Creates walking segment between two points
     * @param {Object} from - Starting point
     * @param {Object} to - Ending point
     * @param {Object} options - Additional options
     * @returns {Object} - Walking segment data
     */
    async createWalkingSegment(from, to, options = {}) {
        const fromCoords = this.extractCoordinates(from);
        const toCoords = this.extractCoordinates(to);

        if (!fromCoords || !toCoords) {
            return null;
        }

        const distance = this.calculateDistance(fromCoords, toCoords);
        const duration = this.estimateTravelTime(distance, 'walking');

        // Get enhanced walking route if possible
        let coordinates = [fromCoords, toCoords];
        try {
            const walkingRoute = await routingService.getWalkingRoute(fromCoords, toCoords);
            if (walkingRoute && walkingRoute.coordinates) {
                coordinates = walkingRoute.coordinates;
            }
        } catch (error) {
            console.warn('Could not get enhanced walking route:', error);
        }

        return {
            type: 'walking',
            from: from,
            to: to,
            distance: distance,
            duration: duration,
            coordinates: coordinates,
            ...options
        };
    }

    /**
     * Creates bus segment between stops
     * @param {Object} from - Starting stop
     * @param {Object} to - Ending stop
     * @param {Object} line - Bus line
     * @param {Array} intermediateStops - Stops between from and to
     * @param {Object} options - Additional options
     * @returns {Object} - Bus segment data
     */
    async createBusSegment(from, to, line, intermediateStops = [], options = {}) {
        const fromCoords = this.extractCoordinates(from);
        const toCoords = this.extractCoordinates(to);

        if (!fromCoords || !toCoords) {
            return null;
        }

        const distance = this.calculateDistance(fromCoords, toCoords);
        let duration = this.estimateTravelTime(distance, 'bus');

        // Add time for intermediate stops
        duration += intermediateStops.length * 1; // 1 minute per stop

        // Get enhanced bus route if possible
        let coordinates = [fromCoords, toCoords];
        try {
            const allStops = [from, ...intermediateStops, to];
            const busRoute = await routingService.getBusRoute(allStops);
            if (busRoute && busRoute.coordinates) {
                coordinates = busRoute.coordinates;
            }
        } catch (error) {
            console.warn('Could not get enhanced bus route:', error);
        }

        return {
            type: 'bus',
            from: from,
            to: to,
            line: line,
            distance: distance,
            duration: duration,
            coordinates: coordinates,
            intermediateStops: intermediateStops,
            fare: options.fare || 6000,
            ...options
        };
    }

    /**
     * Extracts coordinates from location objects with standardized format
     * @param {Object|Array} location - Location object
     * @returns {Array|null} - [lng, lat] coordinates
     */
    extractCoordinates(location) {
        const coords = routingService.extractCoordinates(location);
        return coords ? RouteComponent.ensureLngLat(coords) : null;
    }

    /**
     * Validates that a route meets basic requirements
     * @param {Route} route - Route to validate
     * @param {Object} constraints - Validation constraints
     * @returns {boolean} - Whether route is valid
     */
    validateRoute(route, constraints = {}) {
        if (!(route instanceof Route)) {
            return false;
        }

        // Default constraints
        const maxWalkingDistance = constraints.maxWalkingDistance || 5; // km
        const maxTransfers = constraints.maxTransfers || 3;
        const maxTotalDuration = constraints.maxTotalDuration || 180; // minutes

        return (
            route.isValid() &&
            route.getWalkingDistance() <= maxWalkingDistance &&
            route.getTransferCount() <= maxTransfers &&
            route.getDuration() <= maxTotalDuration
        );
    }

    /**
     * Gets strategy information for UI display
     * @returns {Object} - Strategy information
     */
    getInfo() {
        return {
            name: this.name,
            icon: this.icon,
            type: this.type,
            description: this.description
        };
    }

    /**
     * Gets user-friendly explanation of what this strategy optimizes for
     * @returns {string} - Strategy explanation
     */
    getExplanation() {
        return this.description;
    }

    /**
     * Determines if this strategy is suitable for given conditions
     * @param {Object} conditions - Route conditions (distance, time constraints, etc.)
     * @returns {boolean} - Whether strategy is suitable
     */
    isSuitableFor(conditions = {}) {
        // Base implementation - can be overridden by specific strategies
        return true;
    }

    /**
     * Gets the priority order for this strategy (lower numbers = higher priority)
     * @param {Object} context - Route context
     * @returns {number} - Priority order
     */
    getPriority(context = {}) {
        // Base implementation - can be overridden by specific strategies
        return 100;
    }
}

export default PathfindingStrategy;