import PathfindingStrategy from './PathfindingStrategy.js';
import Route from '@/components/Route/Route.jsx';

/**
 * BalancedStrategy - Updated to work with Composite pattern
 * Provides a balanced optimization considering time, distance, transfers, and walking
 */
class BalancedStrategy extends PathfindingStrategy {
    constructor() {
        super(
            'Balanced Route',
            '⚖️',
            'Optimizes for a good balance of time, distance, transfers, and walking distance'
        );
    }

    /**
     * Finds the best balanced route between start and end points
     * @param {Array} startCoords - Starting coordinates [lng, lat]
     * @param {Array} endCoords - Ending coordinates [lng, lat]
     * @param {Array} busStops - Available bus stops
     * @param {Array} busLines - Available bus lines
     * @returns {Promise<Object>} - Result with Route object and metadata
     */
    async findPath(startCoords, endCoords, busStops, busLines) {
        try {
            // Find multiple route options
            const routeOptions = await this.generateRouteOptions(startCoords, endCoords, busStops, busLines);

            if (routeOptions.length === 0) {
                // Fallback to walking-only route
                const walkingRoute = await this.createWalkingOnlyRoute(startCoords, endCoords);
                return {
                    path: walkingRoute,
                    metadata: this.createMetadata(walkingRoute, { fallback: 'walking-only' })
                };
            }

            // Score and select best balanced route
            const bestRoute = this.selectBestBalancedRoute(routeOptions);

            return {
                path: bestRoute,
                metadata: this.createMetadata(bestRoute, {
                    optionsConsidered: routeOptions.length,
                    selectionCriteria: 'balanced-optimization'
                })
            };
        } catch (error) {
            console.error('Error in BalancedStrategy.findPath:', error);
            throw error;
        }
    }

    /**
     * Generates multiple route options to evaluate
     * @param {Array} startCoords - Starting coordinates
     * @param {Array} endCoords - Ending coordinates
     * @param {Array} busStops - Available bus stops
     * @param {Array} busLines - Available bus lines
     * @returns {Promise<Array>} - Array of route options
     */
    async generateRouteOptions(startCoords, endCoords, busStops, busLines) {
        const options = [];

        // Find nearby stops
        const nearbyStartStops = this.findNearbyStops(startCoords, busStops, 1.5);
        const nearbyEndStops = this.findNearbyStops(endCoords, busStops, 1.5);

        if (nearbyStartStops.length === 0 || nearbyEndStops.length === 0) {
            return options;
        }

        // Generate single-transfer routes
        for (let startStopData of nearbyStartStops.slice(0, 3)) { // Limit to top 3 starts
            for (let endStopData of nearbyEndStops.slice(0, 3)) { // Limit to top 3 ends
                const directRoute = await this.createDirectRoute(
                    startCoords, endCoords,
                    startStopData, endStopData,
                    busLines
                );

                if (directRoute) {
                    options.push(directRoute);
                }
            }
        }

        // Generate routes with one transfer
        const transferRoutes = await this.generateTransferRoutes(
            startCoords, endCoords,
            nearbyStartStops.slice(0, 2),
            nearbyEndStops.slice(0, 2),
            busStops, busLines
        );

        options.push(...transferRoutes);

        return options;
    }

    /**
     * Creates a direct route (one bus line) between start and end
     * @param {Array} startCoords - Starting coordinates
     * @param {Array} endCoords - Ending coordinates
     * @param {Object} startStopData - Start stop with distance
     * @param {Object} endStopData - End stop with distance
     * @param {Array} busLines - Available bus lines
     * @returns {Promise<Route|null>} - Direct route or null
     */
    async createDirectRoute(startCoords, endCoords, startStopData, endStopData, busLines) {
        const { stop: startStop } = startStopData;
        const { stop: endStop } = endStopData;

        // Find direct connections
        const connections = this.findDirectConnections(startStop, endStop, busLines);

        if (connections.length === 0) {
            return null;
        }

        // Use the best direct connection
        const bestConnection = connections[0];
        const segments = [];

        // Walking to start stop
        const walkToStart = await this.createWalkingSegment(
            { name: 'Start', coordinates: startCoords },
            startStop
        );
        if (walkToStart) segments.push(walkToStart);

        // Bus segment
        const busSegment = await this.createBusSegment(
            startStop,
            endStop,
            bestConnection.line,
            bestConnection.intermediateStops
        );
        if (busSegment) segments.push(busSegment);

        // Walking from end stop
        const walkFromEnd = await this.createWalkingSegment(
            endStop,
            { name: 'Destination', coordinates: endCoords }
        );
        if (walkFromEnd) segments.push(walkFromEnd);

        return this.createRoute(segments, {
            routeType: 'direct',
            transfers: 0
        });
    }

    /**
     * Generates routes with one transfer
     * @param {Array} startCoords - Starting coordinates
     * @param {Array} endCoords - Ending coordinates
     * @param {Array} nearbyStartStops - Nearby start stops
     * @param {Array} nearbyEndStops - Nearby end stops
     * @param {Array} busStops - All bus stops
     * @param {Array} busLines - All bus lines
     * @returns {Promise<Array>} - Array of transfer routes
     */
    async generateTransferRoutes(startCoords, endCoords, nearbyStartStops, nearbyEndStops, busStops, busLines) {
        const transferRoutes = [];

        // Find good transfer points (busy intersections)
        const transferCandidates = this.findTransferCandidates(busStops, busLines);

        for (let startStopData of nearbyStartStops) {
            for (let transferPoint of transferCandidates.slice(0, 5)) { // Top 5 transfer points
                for (let endStopData of nearbyEndStops) {
                    const transferRoute = await this.createTransferRoute(
                        startCoords, endCoords,
                        startStopData.stop, transferPoint, endStopData.stop,
                        busLines
                    );

                    if (transferRoute) {
                        transferRoutes.push(transferRoute);
                    }
                }
            }
        }

        return transferRoutes;
    }

    /**
     * Creates a route with one transfer
     * @param {Array} startCoords - Starting coordinates
     * @param {Array} endCoords - Ending coordinates
     * @param {Object} startStop - Starting bus stop
     * @param {Object} transferStop - Transfer bus stop
     * @param {Object} endStop - Ending bus stop
     * @param {Array} busLines - Available bus lines
     * @returns {Promise<Route|null>} - Transfer route or null
     */
    async createTransferRoute(startCoords, endCoords, startStop, transferStop, endStop, busLines) {
        // Find first leg connection
        const firstLegConnections = this.findDirectConnections(startStop, transferStop, busLines);
        if (firstLegConnections.length === 0) return null;

        // Find second leg connection
        const secondLegConnections = this.findDirectConnections(transferStop, endStop, busLines);
        if (secondLegConnections.length === 0) return null;

        const segments = [];

        // Walking to start stop
        const walkToStart = await this.createWalkingSegment(
            { name: 'Start', coordinates: startCoords },
            startStop
        );
        if (walkToStart) segments.push(walkToStart);

        // First bus segment
        const firstBusSegment = await this.createBusSegment(
            startStop,
            transferStop,
            firstLegConnections[0].line,
            firstLegConnections[0].intermediateStops
        );
        if (firstBusSegment) segments.push(firstBusSegment);

        // Transfer walking (if different stops)
        if (transferStop.id !== transferStop.id) { // This should be a different check in practice
            const transferWalk = await this.createWalkingSegment(transferStop, transferStop);
            if (transferWalk && transferWalk.distance > 0.05) { // Only if significant distance
                segments.push(transferWalk);
            }
        }

        // Second bus segment
        const secondBusSegment = await this.createBusSegment(
            transferStop,
            endStop,
            secondLegConnections[0].line,
            secondLegConnections[0].intermediateStops
        );
        if (secondBusSegment) segments.push(secondBusSegment);

        // Walking from end stop
        const walkFromEnd = await this.createWalkingSegment(
            endStop,
            { name: 'Destination', coordinates: endCoords }
        );
        if (walkFromEnd) segments.push(walkFromEnd);

        return this.createRoute(segments, {
            routeType: 'transfer',
            transfers: 1,
            transferPoint: transferStop
        });
    }

    /**
     * Finds good transfer points based on line intersections
     * @param {Array} busStops - All bus stops
     * @param {Array} busLines - All bus lines
     * @returns {Array} - Transfer candidate stops
     */
    findTransferCandidates(busStops, busLines) {
        const stopLineCount = {};

        // Count how many lines serve each stop
        busLines.forEach(line => {
            if (line.arr_stop && Array.isArray(line.arr_stop)) {
                line.arr_stop.forEach(stop => {
                    const key = stop.id || stop.name;
                    stopLineCount[key] = (stopLineCount[key] || 0) + 1;
                });
            }
        });

        // Find stops served by multiple lines (good transfer points)
        const transferCandidates = busStops
            .filter(stop => (stopLineCount[stop.id] || stopLineCount[stop.name] || 0) >= 2)
            .sort((a, b) => {
                const aCount = stopLineCount[a.id] || stopLineCount[a.name] || 0;
                const bCount = stopLineCount[b.id] || stopLineCount[b.name] || 0;
                return bCount - aCount; // Sort by descending line count
            });

        return transferCandidates;
    }

    /**
     * Creates a walking-only route as fallback
     * @param {Array} startCoords - Starting coordinates
     * @param {Array} endCoords - Ending coordinates
     * @returns {Promise<Route>} - Walking-only route
     */
    async createWalkingOnlyRoute(startCoords, endCoords) {
        const walkingSegment = await this.createWalkingSegment(
            { name: 'Start', coordinates: startCoords },
            { name: 'Destination', coordinates: endCoords }
        );

        return this.createRoute([walkingSegment], {
            routeType: 'walking-only',
            transfers: 0
        });
    }

    /**
     * Selects the best route from options using balanced scoring
     * @param {Array} routeOptions - Array of route options
     * @returns {Route} - Best route
     */
    selectBestBalancedRoute(routeOptions) {
        if (routeOptions.length === 1) {
            return routeOptions[0];
        }

        // Score each route using balanced criteria
        const scoredRoutes = routeOptions.map(route => ({
            route: route,
            score: this.calculateBalancedScore(route)
        }));

        // Sort by score (lower is better)
        scoredRoutes.sort((a, b) => a.score - b.score);

        return scoredRoutes[0].route;
    }

    /**
     * Calculates balanced score for route comparison
     * @param {Route} route - Route to score
     * @returns {number} - Balanced score (lower is better)
     */
    calculateBalancedScore(route) {
        // Balanced weights for different factors
        const weights = {
            distance: 1.0,      // Total distance
            duration: 2.0,      // Total time (most important)
            transfers: 15.0,    // Number of transfers (high penalty)
            walking: 3.0,       // Walking distance
            cost: 0.05,         // Cost (less important)
            complexity: 5.0     // Route complexity
        };

        const distance = route.getDistance();
        const duration = route.getDuration();
        const transfers = route.getTransferCount();
        const walking = route.getWalkingDistance();
        const cost = route.getCost();
        const complexity = route.getComponents().length;

        return (
            (distance * weights.distance) +
            (duration * weights.duration) +
            (transfers * weights.transfers) +
            (walking * weights.walking) +
            (cost * weights.cost) +
            (complexity * weights.complexity)
        );
    }

    /**
     * Creates metadata for the route result
     * @param {Route} route - Created route
     * @param {Object} additionalData - Additional metadata
     * @returns {Object} - Route metadata
     */
    createMetadata(route, additionalData = {}) {
        return {
            strategy: this.type,
            strategyName: this.name,
            score: this.calculateBalancedScore(route),
            transfers: route.getTransferCount(),
            totalDistance: route.getDistance(),
            totalWalking: route.getWalkingDistance(),
            totalDuration: route.getDuration(),
            totalCost: route.getCost(),
            segments: route.getComponents().length,
            confidence: route.confidence || 0.8,
            ...additionalData
        };
    }

    /**
     * Determines if balanced strategy is suitable for given conditions
     * @param {Object} conditions - Route conditions
     * @returns {boolean} - Whether strategy is suitable
     */
    isSuitableFor(conditions = {}) {
        // Balanced strategy is suitable for most conditions
        return true;
    }

    /**
     * Gets priority for balanced strategy
     * @param {Object} context - Route context
     * @returns {number} - Priority (lower = higher priority)
     */
    getPriority(context = {}) {
        // Balanced strategy has medium priority - good default choice
        return 50;
    }
}

export default BalancedStrategy;