import mapBoxFacade from "@/services/ MapBoxFacade.js";

/**
 * RoutingService handles all route-related operations using the MapBoxFacade.
 * This service encapsulates pathfinding logic and route visualization.
 */
class RoutingService {
    constructor() {
        this.mapBoxFacade = mapBoxFacade;
    }

    /**
     * Finds the best route between start and end coordinates
     * @param {Array} startCoords - Starting [lng, lat] coordinates
     * @param {Array} endCoords - Ending [lng, lat] coordinates
     * @param {Array} busStops - Available bus stops
     * @param {Array} busLines - Available bus lines
     * @returns {Object} - Route object with segments
     */
    async findBestRoute(startCoords, endCoords, busStops, busLines) {
        // This method will be implemented with the pathfinding logic
        // For now, it delegates to the existing pathfinding implementation
        return {
            segments: [],
            totalDistance: 0,
            totalDuration: 0
        };
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

        busStops.forEach((stop) => {
            const distance = this.calculateDistance(
                coordinates,
                [stop.pointX, stop.pointY]
            );

            if (distance <= maxDistance) {
                nearbyStops.push({ stop, distance });
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
        const [lng1, lat1] = coord1;
        const [lng2, lat2] = coord2;

        // Simple approximation for small distances
        const distance = Math.sqrt(
            Math.pow(lng2 - lng1, 2) + Math.pow(lat2 - lat1, 2)
        ) * 111; // Convert to km

        return distance;
    }

    /**
     * Optimizes a route based on specified criteria
     * @param {Array} routes - Array of possible routes
     * @param {string} criteria - Optimization criteria
     * @returns {Object} - The optimized route
     */
    optimizeRoute(routes, criteria = 'balanced') {
        if (!routes || routes.length === 0) return null;

        switch (criteria) {
            case 'fastest':
                return routes.reduce((best, route) =>
                    route.totalDuration < best.totalDuration ? route : best
                );
            case 'shortest':
                return routes.reduce((best, route) =>
                    route.totalDistance < best.totalDistance ? route : best
                );
            case 'fewest-transfers':
                return routes.reduce((best, route) =>
                    route.transfers < best.transfers ? route : best
                );
            default: // balanced
                return routes.reduce((best, route) => {
                    const bestScore = this.calculateRouteScore(best);
                    const routeScore = this.calculateRouteScore(route);
                    return routeScore < bestScore ? route : best;
                });
        }
    }

    /**
     * Calculates a weighted score for route comparison
     * @param {Object} route - Route object
     * @returns {number} - Route score (lower is better)
     */
    calculateRouteScore(route) {
        const transferWeight = 2;
        const distanceWeight = 1;
        const durationWeight = 1.5;

        return (
            route.transfers * transferWeight +
            route.totalDistance * distanceWeight +
            route.totalDuration * durationWeight
        );
    }

    /**
     * Gets walking directions between two points
     * @param {Array} startCoords - Starting coordinates
     * @param {Array} endCoords - Ending coordinates
     * @returns {Promise<Object>} - Walking route data
     */
    async getWalkingRoute(startCoords, endCoords) {
        const directionsData = await this.mapBoxFacade.getDirections(
            [startCoords, endCoords],
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

        return null;
    }

    /**
     * Gets bus route between stops
     * @param {Array} stops - Array of bus stops
     * @returns {Promise<Object>} - Bus route data
     */
    async getBusRoute(stops) {
        const coordinates = stops.map(stop => [stop.pointX, stop.pointY]);
        const directionsData = await this.mapBoxFacade.getDirections(
            coordinates,
            'driving'
        );

        if (directionsData.routes && directionsData.routes.length > 0) {
            const route = directionsData.routes[0];
            return {
                coordinates: route.geometry.coordinates,
                distance: route.distance / 1000, // Convert to km
                duration: route.duration / 60 // Convert to minutes
            };
        }

        return null;
    }

    /**
     * Creates route segments for a complete journey
     * @param {Object} pathData - Path data from pathfinding
     * @param {Array} startCoords - Starting coordinates
     * @param {Array} endCoords - Ending coordinates
     * @returns {Promise<Array>} - Array of route segments with directions
     */
    async createRouteSegments(pathData, startCoords, endCoords) {
        const segments = [];

        // Initial walking segment
        if (pathData.segments[0].type === 'walking') {
            const walkingRoute = await this.getWalkingRoute(
                startCoords,
                [pathData.segments[0].to.pointY, pathData.segments[0].to.pointX]
            );

            if (walkingRoute) {
                segments.push({
                    type: 'walking',
                    ...walkingRoute,
                    from: { name: 'Current Location' },
                    to: pathData.segments[0].to
                });
            }
        }

        // Process middle segments
        for (let i = 1; i < pathData.segments.length; i++) {
            const segment = pathData.segments[i];

            if (segment.type === 'walking') {
                const walkingRoute = await this.getWalkingRoute(
                    [segment.from.pointY, segment.from.pointX],
                    [segment.to.pointY, segment.to.pointX]
                );

                if (walkingRoute) {
                    segments.push({
                        type: 'walking',
                        ...walkingRoute,
                        from: segment.from,
                        to: segment.to
                    });
                }
            } else {
                // Bus segment
                const busRoute = await this.getBusRoute(segment.intermediateStops);

                if (busRoute) {
                    segments.push({
                        type: 'bus',
                        ...busRoute,
                        line: segment.line,
                        from: segment.from,
                        to: segment.to,
                        stops: segment.intermediateStops
                    });
                }
            }
        }

        // Final walking segment
        const lastStop = pathData.segments[pathData.segments.length - 1].to;
        const finalWalkingRoute = await this.getWalkingRoute(
            [lastStop.pointY, lastStop.pointX],
            endCoords
        );

        if (finalWalkingRoute) {
            segments.push({
                type: 'walking',
                ...finalWalkingRoute,
                from: lastStop,
                to: { name: 'Destination' }
            });
        }

        return segments;
    }

    /**
     * Validates if a route is feasible
     * @param {Object} route - Route object
     * @returns {boolean} - Whether the route is valid
     */
    validateRoute(route) {
        if (!route || !route.segments || route.segments.length === 0) {
            return false;
        }

        // Check for reasonable constraints
        const maxWalkingDistance = 5; // km
        const maxTransfers = 3;
        const maxTotalDuration = 180; // minutes

        const totalWalking = route.segments
            .filter(s => s.type === 'walking')
            .reduce((sum, s) => sum + s.distance, 0);

        const transfers = route.segments
            .filter(s => s.type === 'bus')
            .length - 1;

        return (
            totalWalking <= maxWalkingDistance &&
            transfers <= maxTransfers &&
            route.totalDuration <= maxTotalDuration
        );
    }
}

// Export singleton instance
const routingService = new RoutingService();
export default routingService;