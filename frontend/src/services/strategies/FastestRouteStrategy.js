import PathfindingStrategy from './PathfindingStrategy.js';
import Route from '@/components/Route/Route.jsx';

/**
 * FastestRouteStrategy - Optimizes for minimal travel time
 * Prioritizes routes that get users to their destination quickly
 */
class FastestRouteStrategy extends PathfindingStrategy {
    constructor() {
        super(
            'Fastest Route',
            '⚡',
            'Finds the quickest route to your destination, prioritizing speed over other factors'
        );
    }

    /**
     * Finds the fastest route between start and end points
     * @param {Array} startCoords - Starting coordinates [lng, lat]
     * @param {Array} endCoords - Ending coordinates [lng, lat]
     * @param {Array} busStops - Available bus stops
     * @param {Array} busLines - Available bus lines
     * @returns {Promise<Object>} - Result with Route object and metadata
     */
    async findPath(startCoords, endCoords, busStops, busLines) {
        try {
            // Generate route options optimized for speed
            const routeOptions = await this.generateFastRouteOptions(startCoords, endCoords, busStops, busLines);

            if (routeOptions.length === 0) {
                // Fallback to direct walking route
                const walkingRoute = await this.createWalkingOnlyRoute(startCoords, endCoords);
                return {
                    path: walkingRoute,
                    metadata: this.createMetadata(walkingRoute, { fallback: 'walking-only' })
                };
            }

            // Select fastest route
            const fastestRoute = this.selectFastestRoute(routeOptions);

            return {
                path: fastestRoute,
                metadata: this.createMetadata(fastestRoute, {
                    optionsConsidered: routeOptions.length,
                    selectionCriteria: 'minimal-duration'
                })
            };
        } catch (error) {
            console.error('Error in FastestRouteStrategy.findPath:', error);
            throw error;
        }
    }

    /**
     * Generates route options optimized for speed
     * @param {Array} startCoords - Starting coordinates
     * @param {Array} endCoords - Ending coordinates
     * @param {Array} busStops - Available bus stops
     * @param {Array} busLines - Available bus lines
     * @returns {Promise<Array>} - Array of fast route options
     */
    async generateFastRouteOptions(startCoords, endCoords, busStops, busLines) {
        const options = [];

        // Find nearby stops with preference for closer ones (less walking time)
        const nearbyStartStops = this.findNearbyStops(startCoords, busStops, 1.0); // Smaller radius for speed
        const nearbyEndStops = this.findNearbyStops(endCoords, busStops, 1.0);

        if (nearbyStartStops.length === 0 || nearbyEndStops.length === 0) {
            return options;
        }

        // Priority 1: Direct express routes
        for (let startStopData of nearbyStartStops.slice(0, 2)) {
            for (let endStopData of nearbyEndStops.slice(0, 2)) {
                const expressRoute = await this.createExpressRoute(
                    startCoords, endCoords,
                    startStopData, endStopData,
                    busLines
                );

                if (expressRoute) {
                    options.push(expressRoute);
                }
            }
        }

        // Priority 2: Fast direct routes (any bus line)
        for (let startStopData of nearbyStartStops.slice(0, 3)) {
            for (let endStopData of nearbyEndStops.slice(0, 3)) {
                const directRoute = await this.createFastDirectRoute(
                    startCoords, endCoords,
                    startStopData, endStopData,
                    busLines
                );

                if (directRoute) {
                    options.push(directRoute);
                }
            }
        }

        // Priority 3: Fast transfer routes (only if direct routes are too slow)
        if (options.length < 3) {
            const transferRoutes = await this.generateFastTransferRoutes(
                startCoords, endCoords,
                nearbyStartStops.slice(0, 2),
                nearbyEndStops.slice(0, 2),
                busStops, busLines
            );

            options.push(...transferRoutes);
        }

        return options;
    }

    /**
     * Creates express route (prioritizes express bus lines)
     * @param {Array} startCoords - Starting coordinates
     * @param {Array} endCoords - Ending coordinates
     * @param {Object} startStopData - Start stop with distance
     * @param {Object} endStopData - End stop with distance
     * @param {Array} busLines - Available bus lines
     * @returns {Promise<Route|null>} - Express route or null
     */
    async createExpressRoute(startCoords, endCoords, startStopData, endStopData, busLines) {
        const { stop: startStop } = startStopData;
        const { stop: endStop } = endStopData;

        // Find connections, preferring express lines
        const connections = this.findDirectConnections(startStop, endStop, busLines);
        const expressConnections = connections.filter(conn =>
            this.isExpressLine(conn.line)
        );

        if (expressConnections.length === 0) {
            return null; // No express connection available
        }

        return this.buildRoute(startCoords, endCoords, expressConnections[0], {
            routeType: 'express',
            vehicleType: 'express'
        });
    }

    /**
     * Creates fast direct route (any bus line, optimized for speed)
     * @param {Array} startCoords - Starting coordinates
     * @param {Array} endCoords - Ending coordinates
     * @param {Object} startStopData - Start stop with distance
     * @param {Object} endStopData - End stop with distance
     * @param {Array} busLines - Available bus lines
     * @returns {Promise<Route|null>} - Fast direct route or null
     */
    async createFastDirectRoute(startCoords, endCoords, startStopData, endStopData, busLines) {
        const { stop: startStop } = startStopData;
        const { stop: endStop } = endStopData;

        const connections = this.findDirectConnections(startStop, endStop, busLines);

        if (connections.length === 0) {
            return null;
        }

        // Sort connections by estimated speed (fewer stops = faster)
        connections.sort((a, b) => {
            const stopsA = a.intermediateStops.length;
            const stopsB = b.intermediateStops.length;
            return stopsA - stopsB; // Fewer stops first
        });

        return this.buildRoute(startCoords, endCoords, connections[0], {
            routeType: 'direct-fast'
        });
    }

    /**
     * Generates fast transfer routes
     * @param {Array} startCoords - Starting coordinates
     * @param {Array} endCoords - Ending coordinates
     * @param {Array} nearbyStartStops - Nearby start stops
     * @param {Array} nearbyEndStops - Nearby end stops
     * @param {Array} busStops - All bus stops
     * @param {Array} busLines - All bus lines
     * @returns {Promise<Array>} - Array of fast transfer routes
     */
    async generateFastTransferRoutes(startCoords, endCoords, nearbyStartStops, nearbyEndStops, busStops, busLines) {
        const transferRoutes = [];

        // Find fast transfer points (major hubs with frequent service)
        const fastTransferPoints = this.findFastTransferPoints(busStops, busLines);

        for (let startStopData of nearbyStartStops) {
            for (let transferPoint of fastTransferPoints.slice(0, 3)) { // Top 3 fast transfer points
                for (let endStopData of nearbyEndStops) {
                    const transferRoute = await this.createFastTransferRoute(
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
     * Creates a fast transfer route
     * @param {Array} startCoords - Starting coordinates
     * @param {Array} endCoords - Ending coordinates
     * @param {Object} startStop - Starting bus stop
     * @param {Object} transferStop - Transfer bus stop
     * @param {Object} endStop - Ending bus stop
     * @param {Array} busLines - Available bus lines
     * @returns {Promise<Route|null>} - Fast transfer route or null
     */
    async createFastTransferRoute(startCoords, endCoords, startStop, transferStop, endStop, busLines) {
        // Find connections prioritizing faster lines
        const firstLegConnections = this.findDirectConnections(startStop, transferStop, busLines)
            .sort((a, b) => this.compareLineSpeed(a.line, b.line));

        const secondLegConnections = this.findDirectConnections(transferStop, endStop, busLines)
            .sort((a, b) => this.compareLineSpeed(a.line, b.line));

        if (firstLegConnections.length === 0 || secondLegConnections.length === 0) {
            return null;
        }

        const segments = [];

        // Walking to start stop (minimize walking time)
        const walkToStart = await this.createWalkingSegment(
            { name: 'Start', coordinates: startCoords },
            startStop
        );
        if (walkToStart) segments.push(walkToStart);

        // First bus segment (choose fastest line)
        const firstBusSegment = await this.createBusSegment(
            startStop,
            transferStop,
            firstLegConnections[0].line,
            firstLegConnections[0].intermediateStops,
            { vehicleType: this.isExpressLine(firstLegConnections[0].line) ? 'express' : 'standard' }
        );
        if (firstBusSegment) segments.push(firstBusSegment);

        // Minimal transfer time (assume same stop or very close)
        // Second bus segment (choose fastest line)
        const secondBusSegment = await this.createBusSegment(
            transferStop,
            endStop,
            secondLegConnections[0].line,
            secondLegConnections[0].intermediateStops,
            { vehicleType: this.isExpressLine(secondLegConnections[0].line) ? 'express' : 'standard' }
        );
        if (secondBusSegment) segments.push(secondBusSegment);

        // Walking from end stop
        const walkFromEnd = await this.createWalkingSegment(
            endStop,
            { name: 'Destination', coordinates: endCoords }
        );
        if (walkFromEnd) segments.push(walkFromEnd);

        return this.createRoute(segments, {
            routeType: 'fast-transfer',
            transfers: 1,
            transferPoint: transferStop
        });
    }

    /**
     * Builds a route from connection information
     * @param {Array} startCoords - Starting coordinates
     * @param {Array} endCoords - Ending coordinates
     * @param {Object} connection - Bus line connection info
     * @param {Object} options - Route options
     * @returns {Promise<Route>} - Built route
     */
    async buildRoute(startCoords, endCoords, connection, options = {}) {
        const segments = [];

        // Walking to start stop
        const walkToStart = await this.createWalkingSegment(
            { name: 'Start', coordinates: startCoords },
            connection.line.arr_stop[connection.startIndex]
        );
        if (walkToStart) segments.push(walkToStart);

        // Main bus segment
        const busSegment = await this.createBusSegment(
            connection.line.arr_stop[connection.startIndex],
            connection.line.arr_stop[connection.endIndex],
            connection.line,
            connection.intermediateStops,
            options
        );
        if (busSegment) segments.push(busSegment);

        // Walking from end stop
        const walkFromEnd = await this.createWalkingSegment(
            connection.line.arr_stop[connection.endIndex],
            { name: 'Destination', coordinates: endCoords }
        );
        if (walkFromEnd) segments.push(walkFromEnd);

        return this.createRoute(segments, options);
    }

    /**
     * Finds fast transfer points (major transit hubs)
     * @param {Array} busStops - All bus stops
     * @param {Array} busLines - All bus lines
     * @returns {Array} - Fast transfer candidate stops
     */
    findFastTransferPoints(busStops, busLines) {
        const stopLineCount = {};
        const stopExpressCount = {};

        // Count regular and express lines serving each stop
        busLines.forEach(line => {
            const isExpress = this.isExpressLine(line);

            if (line.arr_stop && Array.isArray(line.arr_stop)) {
                line.arr_stop.forEach(stop => {
                    const key = stop.id || stop.name;
                    stopLineCount[key] = (stopLineCount[key] || 0) + 1;
                    if (isExpress) {
                        stopExpressCount[key] = (stopExpressCount[key] || 0) + 1;
                    }
                });
            }
        });

        // Prioritize stops with express service and multiple lines
        return busStops
            .filter(stop => (stopLineCount[stop.id] || stopLineCount[stop.name] || 0) >= 2)
            .sort((a, b) => {
                const aKey = a.id || a.name;
                const bKey = b.id || b.name;

                const aExpress = stopExpressCount[aKey] || 0;
                const bExpress = stopExpressCount[bKey] || 0;
                const aTotal = stopLineCount[aKey] || 0;
                const bTotal = stopLineCount[bKey] || 0;

                // Primary sort: express line count (descending)
                if (aExpress !== bExpress) {
                    return bExpress - aExpress;
                }

                // Secondary sort: total line count (descending)
                return bTotal - aTotal;
            });
    }

    /**
     * Selects the fastest route from options
     * @param {Array} routeOptions - Array of route options
     * @returns {Route} - Fastest route
     */
    selectFastestRoute(routeOptions) {
        if (routeOptions.length === 1) {
            return routeOptions[0];
        }

        // Sort by duration (ascending)
        routeOptions.sort((a, b) => a.getDuration() - b.getDuration());

        return routeOptions[0];
    }

    /**
     * Checks if a bus line is an express service
     * @param {Object} line - Bus line object
     * @returns {boolean} - Whether line is express
     */
    isExpressLine(line) {
        if (!line || !line.name) return false;

        const name = line.name.toLowerCase();
        return name.includes('express') ||
            name.includes('brt') ||
            name.includes('rapid') ||
            name.includes('limited');
    }

    /**
     * Compares line speed for sorting (returns negative if a is faster)
     * @param {Object} lineA - First bus line
     * @param {Object} lineB - Second bus line
     * @returns {number} - Comparison result
     */
    compareLineSpeed(lineA, lineB) {
        const speedA = this.isExpressLine(lineA) ? 1 : 2; // Lower number = faster
        const speedB = this.isExpressLine(lineB) ? 1 : 2;

        return speedA - speedB;
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
     * Creates metadata for the route result
     * @param {Route} route - Created route
     * @param {Object} additionalData - Additional metadata
     * @returns {Object} - Route metadata
     */
    createMetadata(route, additionalData = {}) {
        return {
            strategy: this.type,
            strategyName: this.name,
            score: route.getDuration(), // For fastest route, score is just duration
            transfers: route.getTransferCount(),
            totalDistance: route.getDistance(),
            totalWalking: route.getWalkingDistance(),
            totalDuration: route.getDuration(),
            totalCost: route.getCost(),
            segments: route.getComponents().length,
            confidence: route.confidence || 0.85, // High confidence for time-optimized routes
            optimizationFactor: 'duration',
            ...additionalData
        };
    }

    /**
     * Determines if fastest strategy is suitable for given conditions
     * @param {Object} conditions - Route conditions
     * @returns {boolean} - Whether strategy is suitable
     */
    isSuitableFor(conditions = {}) {
        // Fastest strategy is suitable when time is critical
        return conditions.prioritizeSpeed ||
            conditions.timeConstrained ||
            conditions.urgency === 'high';
    }

    /**
     * Gets priority for fastest strategy
     * @param {Object} context - Route context
     * @returns {number} - Priority (lower = higher priority)
     */
    getPriority(context = {}) {
        // High priority when speed is important
        if (context.urgency === 'high' || context.prioritizeSpeed) {
            return 10;
        }

        return 30;
    }
}

export default FastestRouteStrategy;