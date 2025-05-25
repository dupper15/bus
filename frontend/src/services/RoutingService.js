import mapBoxFacade from "./MapBoxFacade.js";

/**
 * RoutingService handles all route-related operations using the MapBoxFacade.
 * Enhanced to work seamlessly with the Strategy pattern for pathfinding.
 */
class RoutingService {
    constructor() {
        this.mapBoxFacade = mapBoxFacade;
    }

    /**
     * Finds the best route between start and end coordinates
     * This method is now used by pathfinding strategies
     * @param {Array} startCoords - Starting [lng, lat] coordinates
     * @param {Array} endCoords - Ending [lng, lat] coordinates
     * @param {Array} busStops - Available bus stops
     * @param {Array} busLines - Available bus lines
     * @returns {Object} - Route object with segments
     */
    async findBestRoute(startCoords, endCoords, busStops, busLines) {
        // This method is now primarily used as a helper for strategies
        // The actual pathfinding logic is delegated to the strategy pattern
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
     * Optimizes a route based on specified criteria
     * This method works with the strategy pattern to provide different optimization approaches
     * @param {Array} routes - Array of possible routes
     * @param {string} criteria - Optimization criteria
     * @returns {Object} - The optimized route
     */
    optimizeRoute(routes, criteria = 'balanced') {
        if (!routes || routes.length === 0) return null;

        switch (criteria) {
            case 'fastest':
                return routes.reduce((best, route) =>
                    (route.totalDuration || 0) < (best.totalDuration || 0) ? route : best
                );
            case 'shortest':
                return routes.reduce((best, route) =>
                    (route.totalDistance || 0) < (best.totalDistance || 0) ? route : best
                );
            case 'fewest-transfers':
                return routes.reduce((best, route) =>
                    (route.transfers || 0) < (best.transfers || 0) ? route : best
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
     * Used by multiple strategies for route evaluation
     * @param {Object} route - Route object
     * @returns {number} - Route score (lower is better)
     */
    calculateRouteScore(route) {
        const transferWeight = 2;
        const distanceWeight = 1;
        const durationWeight = 1.5;
        const walkingWeight = 2;

        return (
            (route.transfers || 0) * transferWeight +
            (route.totalDistance || 0) * distanceWeight +
            (route.totalDuration || 0) * durationWeight +
            (route.totalWalking || 0) * walkingWeight
        );
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
        } catch (error) {
            console.error('Error getting bus route:', error);
        }

        return null;
    }

    /**
     * Creates route segments for a complete journey
     * Enhanced to work with strategy pattern results
     * @param {Object} pathData - Path data from pathfinding strategy
     * @param {Array} startCoords - Starting coordinates
     * @param {Array} endCoords - Ending coordinates
     * @returns {Promise<Array>} - Array of route segments with directions
     */
    async createRouteSegments(pathData, startCoords, endCoords) {
        const segments = [];

        try {
            // Initial walking segment to first stop
            if (pathData.segments && pathData.segments.length > 0) {
                const firstSegment = pathData.segments[0];

                if (firstSegment.type === 'walking' && firstSegment.to) {
                    const toCoords = this.extractCoordinates(firstSegment.to);
                    if (toCoords) {
                        const walkingRoute = await this.getWalkingRoute(startCoords, toCoords);
                        if (walkingRoute) {
                            segments.push({
                                type: 'walking',
                                ...walkingRoute,
                                from: { name: 'Current Location', coordinates: startCoords },
                                to: firstSegment.to
                            });
                        }
                    }
                }

                // Process all segments
                for (let i = 0; i < pathData.segments.length; i++) {
                    const segment = pathData.segments[i];

                    if (segment.type === 'walking' && i > 0) {
                        // Walking transfer between stops
                        const fromCoords = this.extractCoordinates(segment.from);
                        const toCoords = this.extractCoordinates(segment.to);

                        if (fromCoords && toCoords) {
                            const walkingRoute = await this.getWalkingRoute(fromCoords, toCoords);
                            if (walkingRoute) {
                                segments.push({
                                    type: 'walking',
                                    ...walkingRoute,
                                    from: segment.from,
                                    to: segment.to
                                });
                            }
                        }
                    } else if (segment.type === 'bus') {
                        // Bus segment
                        const intermediateStops = segment.intermediateStops || [segment.from, segment.to];
                        const busRoute = await this.getBusRoute(intermediateStops);

                        if (busRoute) {
                            segments.push({
                                type: 'bus',
                                ...busRoute,
                                line: segment.line,
                                from: segment.from,
                                to: segment.to,
                                intermediateStops: intermediateStops,
                                stops: intermediateStops
                            });
                        }
                    }
                }

                // Final walking segment to destination
                const lastBusSegment = pathData.segments.filter(s => s.type === 'bus').pop();
                if (lastBusSegment && lastBusSegment.to && pathData.finalWalkDistance) {
                    const fromCoords = this.extractCoordinates(lastBusSegment.to);
                    if (fromCoords) {
                        const finalWalkingRoute = await this.getWalkingRoute(fromCoords, endCoords);
                        if (finalWalkingRoute) {
                            segments.push({
                                type: 'walking',
                                ...finalWalkingRoute,
                                distance: pathData.finalWalkDistance,
                                from: lastBusSegment.to,
                                to: { name: 'Destination', coordinates: endCoords }
                            });
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error creating route segments:', error);
        }

        return segments;
    }

    /**
     * Extracts coordinates from various location formats
     * @param {Object|Array} location - Location object or coordinates
     * @returns {Array|null} - [lng, lat] coordinates
     */
    extractCoordinates(location) {
        if (!location) return null;

        // Array format [lng, lat] or [lat, lng]
        if (Array.isArray(location) && location.length >= 2) {
            return [location[1], location[0]]; // Ensure [lng, lat] format
        }

        // Object with pointX, pointY (bus stop format)
        if (location.pointX !== undefined && location.pointY !== undefined) {
            return [location.pointX, location.pointY];
        }

        // Object with lng, lat
        if (location.lng !== undefined && location.lat !== undefined) {
            return [location.lng, location.lat];
        }

        // Object with longitude, latitude
        if (location.longitude !== undefined && location.latitude !== undefined) {
            return [location.longitude, location.latitude];
        }

        // Object with coordinates array
        if (location.coordinates && Array.isArray(location.coordinates)) {
            return this.extractCoordinates(location.coordinates);
        }

        return null;
    }

    /**
     * Validates if a route is feasible
     * Enhanced with strategy-aware validation
     * @param {Object} route - Route object
     * @param {Object} constraints - Validation constraints
     * @returns {boolean} - Whether the route is valid
     */
    validateRoute(route, constraints = {}) {
        if (!route || !route.segments || route.segments.length === 0) {
            return false;
        }

        // Default constraints
        const maxWalkingDistance = constraints.maxWalkingDistance || 5; // km
        const maxTransfers = constraints.maxTransfers || 3;
        const maxTotalDuration = constraints.maxTotalDuration || 180; // minutes

        const totalWalking = route.segments
            .filter(s => s.type === 'walking')
            .reduce((sum, s) => sum + (s.distance || 0), 0);

        const transfers = route.segments
            .filter(s => s.type === 'bus')
            .length - 1;

        const totalDuration = route.totalDuration || 0;

        return (
            totalWalking <= maxWalkingDistance &&
            transfers <= maxTransfers &&
            totalDuration <= maxTotalDuration
        );
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
     * Gets route summary statistics
     * @param {Object} route - Route object
     * @returns {Object} - Route statistics
     */
    getRouteSummary(route) {
        if (!route || !route.segments) {
            return null;
        }

        const walkingSegments = route.segments.filter(s => s.type === 'walking');
        const busSegments = route.segments.filter(s => s.type === 'bus');

        const totalWalking = walkingSegments.reduce((sum, s) => sum + (s.distance || 0), 0);
        const totalBusDistance = busSegments.reduce((sum, s) => sum + (s.distance || 0), 0);
        const totalDistance = totalWalking + totalBusDistance;

        const walkingTime = walkingSegments.reduce((sum, s) => sum + (s.duration || 0), 0);
        const busTime = busSegments.reduce((sum, s) => sum + (s.duration || 0), 0);
        const transferTime = Math.max(0, busSegments.length - 1) * 5; // 5 minutes per transfer
        const totalTime = walkingTime + busTime + transferTime;

        return {
            totalDistance: totalDistance,
            totalWalking: totalWalking,
            totalBusDistance: totalBusDistance,
            totalTime: totalTime,
            walkingTime: walkingTime,
            busTime: busTime,
            transferTime: transferTime,
            transfers: Math.max(0, busSegments.length - 1),
            segments: route.segments.length
        };
    }
}

// Export singleton instance
const routingService = new RoutingService();
export default routingService;