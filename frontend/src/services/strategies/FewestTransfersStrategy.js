import PathfindingStrategy from './PathfindingStrategy.js';
import Route from '@/components/Route/Route.jsx';

/**
 * FewestTransfersStrategy - Minimizes the number of bus transfers
 * Prioritizes routes with direct connections or minimal transfers for user convenience
 */
class FewestTransfersStrategy extends PathfindingStrategy {
    constructor() {
        super(
            'Fewest Transfers',
            '🎯',
            'Finds routes with the least number of transfers, prioritizing convenience and simplicity'
        );
    }

    /**
     * Finds route with minimal transfers between start and end points
     * @param {Array} startCoords - Starting coordinates [lng, lat]
     * @param {Array} endCoords - Ending coordinates [lng, lat]
     * @param {Array} busStops - Available bus stops
     * @param {Array} busLines - Available bus lines
     * @returns {Promise<Object>} - Result with Route object and metadata
     */
    async findPath(startCoords, endCoords, busStops, busLines) {
        try {
            // Try to find routes in order of preference: 0 transfers, 1 transfer, 2 transfers
            let bestRoute = null;
            let routeMetadata = {};

            // Priority 1: Direct routes (0 transfers)
            const directRoutes = await this.findDirectRoutes(startCoords, endCoords, busStops, busLines);
            if (directRoutes.length > 0) {
                bestRoute = this.selectBestDirectRoute(directRoutes);
                routeMetadata = { routeType: 'direct', transfers: 0, optionsConsidered: directRoutes.length };
            }

            // Priority 2: Single transfer routes (1 transfer) - only if no direct route found
            if (!bestRoute) {
                const singleTransferRoutes = await this.findSingleTransferRoutes(startCoords, endCoords, busStops, busLines);
                if (singleTransferRoutes.length > 0) {
                    bestRoute = this.selectBestTransferRoute(singleTransferRoutes);
                    routeMetadata = { routeType: 'single-transfer', transfers: 1, optionsConsidered: singleTransferRoutes.length };
                }
            }

            // Priority 3: Two transfer routes (2 transfers) - only if nothing else works
            if (!bestRoute) {
                const doubleTransferRoutes = await this.findDoubleTransferRoutes(startCoords, endCoords, busStops, busLines);
                if (doubleTransferRoutes.length > 0) {
                    bestRoute = this.selectBestTransferRoute(doubleTransferRoutes);
                    routeMetadata = { routeType: 'double-transfer', transfers: 2, optionsConsidered: doubleTransferRoutes.length };
                }
            }

            // Fallback: Walking-only route
            if (!bestRoute) {
                bestRoute = await this.createWalkingOnlyRoute(startCoords, endCoords);
                routeMetadata = { routeType: 'walking-only', transfers: 0, fallback: true };
            }

            return {
                path: bestRoute,
                metadata: this.createMetadata(bestRoute, routeMetadata)
            };
        } catch (error) {
            console.error('Error in FewestTransfersStrategy.findPath:', error);
            throw error;
        }
    }

    /**
     * Finds all possible direct routes (0 transfers)
     * @param {Array} startCoords - Starting coordinates
     * @param {Array} endCoords - Ending coordinates
     * @param {Array} busStops - Available bus stops
     * @param {Array} busLines - Available bus lines
     * @returns {Promise<Array>} - Array of direct routes
     */
    async findDirectRoutes(startCoords, endCoords, busStops, busLines) {
        const directRoutes = [];

        // Find nearby stops with larger radius to maximize direct connection chances
        const nearbyStartStops = this.findNearbyStops(startCoords, busStops, 2.0); // Larger radius
        const nearbyEndStops = this.findNearbyStops(endCoords, busStops, 2.0);

        if (nearbyStartStops.length === 0 || nearbyEndStops.length === 0) {
            return directRoutes;
        }

        // Check all combinations for direct connections
        for (let startStopData of nearbyStartStops) {
            for (let endStopData of nearbyEndStops) {
                const directConnections = this.findDirectConnections(
                    startStopData.stop,
                    endStopData.stop,
                    busLines
                );

                for (let connection of directConnections) {
                    const route = await this.createDirectRoute(
                        startCoords, endCoords,
                        startStopData, endStopData,
                        connection
                    );

                    if (route) {
                        directRoutes.push(route);
                    }
                }
            }
        }

        return directRoutes;
    }

    /**
     * Creates a direct route from connection data
     * @param {Array} startCoords - Starting coordinates
     * @param {Array} endCoords - Ending coordinates
     * @param {Object} startStopData - Start stop with distance
     * @param {Object} endStopData - End stop with distance
     * @param {Object} connection - Bus line connection
     * @returns {Promise<Route>} - Direct route
     */
    async createDirectRoute(startCoords, endCoords, startStopData, endStopData, connection) {
        const { stop: startStop, distance: walkToStartDistance } = startStopData;
        const { stop: endStop, distance: walkFromEndDistance } = endStopData;

        const segments = [];

        // Walking to start stop
        const walkToStart = await this.createWalkingSegment(
            { name: 'Start', coordinates: startCoords },
            startStop
        );
        if (walkToStart) segments.push(walkToStart);

        // Main bus segment
        const busSegment = await this.createBusSegment(
            startStop,
            endStop,
            connection.line,
            connection.intermediateStops,
            {
                connectionType: 'direct',
                walkingToStart: walkToStartDistance,
                walkingFromEnd: walkFromEndDistance
            }
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
            transfers: 0,
            busLine: connection.line,
            totalWalkingDistance: walkToStartDistance + walkFromEndDistance
        });
    }

    /**
     * Finds routes with exactly one transfer
     * @param {Array} startCoords - Starting coordinates
     * @param {Array} endCoords - Ending coordinates
     * @param {Array} busStops - Available bus stops
     * @param {Array} busLines - Available bus lines
     * @returns {Promise<Array>} - Array of single transfer routes
     */
    async findSingleTransferRoutes(startCoords, endCoords, busStops, busLines) {
        const singleTransferRoutes = [];

        // Find good transfer hubs
        const transferHubs = this.findOptimalTransferHubs(busStops, busLines);
        const nearbyStartStops = this.findNearbyStops(startCoords, busStops, 1.5);
        const nearbyEndStops = this.findNearbyStops(endCoords, busStops, 1.5);

        // Try combinations with each transfer hub
        for (let transferHub of transferHubs.slice(0, 8)) { // Limit to top 8 transfer hubs
            for (let startStopData of nearbyStartStops.slice(0, 3)) {
                for (let endStopData of nearbyEndStops.slice(0, 3)) {
                    const transferRoute = await this.createSingleTransferRoute(
                        startCoords, endCoords,
                        startStopData.stop, transferHub, endStopData.stop,
                        busLines
                    );

                    if (transferRoute) {
                        singleTransferRoutes.push(transferRoute);
                    }
                }
            }
        }

        return singleTransferRoutes;
    }

    /**
     * Creates a route with exactly one transfer
     * @param {Array} startCoords - Starting coordinates
     * @param {Array} endCoords - Ending coordinates
     * @param {Object} startStop - Starting bus stop
     * @param {Object} transferHub - Transfer hub stop
     * @param {Object} endStop - Ending bus stop
     * @param {Array} busLines - Available bus lines
     * @returns {Promise<Route|null>} - Single transfer route or null
     */
    async createSingleTransferRoute(startCoords, endCoords, startStop, transferHub, endStop, busLines) {
        // Find first leg connections
        const firstLegConnections = this.findDirectConnections(startStop, transferHub, busLines);
        if (firstLegConnections.length === 0) return null;

        // Find second leg connections
        const secondLegConnections = this.findDirectConnections(transferHub, endStop, busLines);
        if (secondLegConnections.length === 0) return null;

        // Select best connections (prioritize fewer intermediate stops)
        const bestFirstLeg = this.selectBestConnection(firstLegConnections);
        const bestSecondLeg = this.selectBestConnection(secondLegConnections);

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
            transferHub,
            bestFirstLeg.line,
            bestFirstLeg.intermediateStops
        );
        if (firstBusSegment) segments.push(firstBusSegment);

        // Transfer waiting time (minimal walking at same hub)
        // In practice, this might involve a short walk between platforms

        // Second bus segment
        const secondBusSegment = await this.createBusSegment(
            transferHub,
            endStop,
            bestSecondLeg.line,
            bestSecondLeg.intermediateStops
        );
        if (secondBusSegment) segments.push(secondBusSegment);

        // Walking from end stop
        const walkFromEnd = await this.createWalkingSegment(
            endStop,
            { name: 'Destination', coordinates: endCoords }
        );
        if (walkFromEnd) segments.push(walkFromEnd);

        return this.createRoute(segments, {
            routeType: 'single-transfer',
            transfers: 1,
            transferHub: transferHub,
            firstLeg: bestFirstLeg.line,
            secondLeg: bestSecondLeg.line
        });
    }

    /**
     * Finds routes with exactly two transfers (last resort)
     * @param {Array} startCoords - Starting coordinates
     * @param {Array} endCoords - Ending coordinates
     * @param {Array} busStops - Available bus stops
     * @param {Array} busLines - Available bus lines
     * @returns {Promise<Array>} - Array of double transfer routes
     */
    async findDoubleTransferRoutes(startCoords, endCoords, busStops, busLines) {
        const doubleTransferRoutes = [];

        // Find major transfer hubs
        const majorHubs = this.findOptimalTransferHubs(busStops, busLines).slice(0, 5);
        const nearbyStartStops = this.findNearbyStops(startCoords, busStops, 1.5);
        const nearbyEndStops = this.findNearbyStops(endCoords, busStops, 1.5);

        // Try combinations with two transfer points
        for (let firstHub of majorHubs) {
            for (let secondHub of majorHubs) {
                if (firstHub.id === secondHub.id) continue; // Same hub

                for (let startStopData of nearbyStartStops.slice(0, 2)) {
                    for (let endStopData of nearbyEndStops.slice(0, 2)) {
                        const doubleTransferRoute = await this.createDoubleTransferRoute(
                            startCoords, endCoords,
                            startStopData.stop, firstHub, secondHub, endStopData.stop,
                            busLines
                        );

                        if (doubleTransferRoute) {
                            doubleTransferRoutes.push(doubleTransferRoute);
                        }
                    }
                }
            }
        }

        return doubleTransferRoutes.slice(0, 5); // Limit to 5 best options
    }

    /**
     * Creates a route with two transfers
     * @param {Array} startCoords - Starting coordinates
     * @param {Array} endCoords - Ending coordinates
     * @param {Object} startStop - Starting bus stop
     * @param {Object} firstHub - First transfer hub
     * @param {Object} secondHub - Second transfer hub
     * @param {Object} endStop - Ending bus stop
     * @param {Array} busLines - Available bus lines
     * @returns {Promise<Route|null>} - Double transfer route or null
     */
    async createDoubleTransferRoute(startCoords, endCoords, startStop, firstHub, secondHub, endStop, busLines) {
        // Find all three leg connections
        const firstLegConnections = this.findDirectConnections(startStop, firstHub, busLines);
        const secondLegConnections = this.findDirectConnections(firstHub, secondHub, busLines);
        const thirdLegConnections = this.findDirectConnections(secondHub, endStop, busLines);

        if (firstLegConnections.length === 0 ||
            secondLegConnections.length === 0 ||
            thirdLegConnections.length === 0) {
            return null;
        }

        // Select best connections for each leg
        const bestFirstLeg = this.selectBestConnection(firstLegConnections);
        const bestSecondLeg = this.selectBestConnection(secondLegConnections);
        const bestThirdLeg = this.selectBestConnection(thirdLegConnections);

        const segments = [];

        // Build the route segments
        const walkToStart = await this.createWalkingSegment(
            { name: 'Start', coordinates: startCoords },
            startStop
        );
        if (walkToStart) segments.push(walkToStart);

        const firstBusSegment = await this.createBusSegment(
            startStop, firstHub, bestFirstLeg.line, bestFirstLeg.intermediateStops
        );
        if (firstBusSegment) segments.push(firstBusSegment);

        const secondBusSegment = await this.createBusSegment(
            firstHub, secondHub, bestSecondLeg.line, bestSecondLeg.intermediateStops
        );
        if (secondBusSegment) segments.push(secondBusSegment);

        const thirdBusSegment = await this.createBusSegment(
            secondHub, endStop, bestThirdLeg.line, bestThirdLeg.intermediateStops
        );
        if (thirdBusSegment) segments.push(thirdBusSegment);

        const walkFromEnd = await this.createWalkingSegment(
            endStop,
            { name: 'Destination', coordinates: endCoords }
        );
        if (walkFromEnd) segments.push(walkFromEnd);

        return this.createRoute(segments, {
            routeType: 'double-transfer',
            transfers: 2,
            firstHub: firstHub,
            secondHub: secondHub
        });
    }

    /**
     * Finds optimal transfer hubs based on connectivity
     * @param {Array} busStops - All bus stops
     * @param {Array} busLines - All bus lines
     * @returns {Array} - Sorted array of transfer hubs (best first)
     */
    findOptimalTransferHubs(busStops, busLines) {
        const stopConnectivity = {};

        // Calculate connectivity score for each stop
        busLines.forEach(line => {
            if (line.arr_stop && Array.isArray(line.arr_stop)) {
                line.arr_stop.forEach(stop => {
                    const key = stop.id || stop.name;
                    if (!stopConnectivity[key]) {
                        stopConnectivity[key] = {
                            stop: stop,
                            lineCount: 0,
                            connections: new Set()
                        };
                    }
                    stopConnectivity[key].lineCount++;
                    stopConnectivity[key].connections.add(line.id || line.name);
                });
            }
        });

        // Sort stops by connectivity (more lines = better transfer hub)
        return Object.values(stopConnectivity)
            .filter(data => data.lineCount >= 2) // Must serve at least 2 lines
            .sort((a, b) => b.lineCount - a.lineCount)
            .map(data => data.stop);
    }

    /**
     * Selects the best connection from multiple options
     * @param {Array} connections - Array of connection options
     * @returns {Object} - Best connection
     */
    selectBestConnection(connections) {
        if (connections.length === 1) {
            return connections[0];
        }

        // Prefer connections with fewer intermediate stops (more direct)
        connections.sort((a, b) => {
            const stopsA = a.intermediateStops.length;
            const stopsB = b.intermediateStops.length;
            return stopsA - stopsB;
        });

        return connections[0];
    }

    /**
     * Selects the best direct route from multiple options
     * @param {Array} directRoutes - Array of direct route options
     * @returns {Route} - Best direct route
     */
    selectBestDirectRoute(directRoutes) {
        if (directRoutes.length === 1) {
            return directRoutes[0];
        }

        // Score routes based on total walking distance and duration
        const scoredRoutes = directRoutes.map(route => ({
            route: route,
            score: this.calculateDirectRouteScore(route)
        }));

        scoredRoutes.sort((a, b) => a.score - b.score);
        return scoredRoutes[0].route;
    }

    /**
     * Selects the best transfer route from multiple options
     * @param {Array} transferRoutes - Array of transfer route options
     * @returns {Route} - Best transfer route
     */
    selectBestTransferRoute(transferRoutes) {
        if (transferRoutes.length === 1) {
            return transferRoutes[0];
        }

        // Score routes prioritizing fewer transfers, then total time
        const scoredRoutes = transferRoutes.map(route => ({
            route: route,
            score: this.calculateTransferRouteScore(route)
        }));

        scoredRoutes.sort((a, b) => a.score - b.score);
        return scoredRoutes[0].route;
    }

    /**
     * Calculates score for direct routes
     * @param {Route} route - Route to score
     * @returns {number} - Route score (lower is better)
     */
    calculateDirectRouteScore(route) {
        const walkingDistance = route.getWalkingDistance();
        const totalDuration = route.getDuration();

        // Heavily weight walking distance for direct routes
        return (walkingDistance * 10) + (totalDuration * 0.5);
    }

    /**
     * Calculates score for transfer routes
     * @param {Route} route - Route to score
     * @returns {number} - Route score (lower is better)
     */
    calculateTransferRouteScore(route) {
        const transfers = route.getTransferCount();
        const walkingDistance = route.getWalkingDistance();
        const totalDuration = route.getDuration();

        // Heavily penalize additional transfers
        return (transfers * 50) + (walkingDistance * 5) + (totalDuration * 1);
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
            score: route.getTransferCount() * 10 + route.getDuration() * 0.1, // Transfers weighted heavily
            transfers: route.getTransferCount(),
            totalDistance: route.getDistance(),
            totalWalking: route.getWalkingDistance(),
            totalDuration: route.getDuration(),
            totalCost: route.getCost(),
            segments: route.getComponents().length,
            confidence: route.confidence || 0.9, // High confidence for minimal transfer routes
            optimizationFactor: 'transfers',
            ...additionalData
        };
    }

    /**
     * Determines if fewest transfers strategy is suitable for given conditions
     * @param {Object} conditions - Route conditions
     * @returns {boolean} - Whether strategy is suitable
     */
    isSuitableFor(conditions = {}) {
        // Suitable when user wants simplicity or has mobility constraints
        return conditions.prioritizeSimplicity ||
            conditions.mobilityConstraints ||
            conditions.avoidTransfers ||
            conditions.carriesLuggage;
    }

    /**
     * Gets priority for fewest transfers strategy
     * @param {Object} context - Route context
     * @returns {number} - Priority (lower = higher priority)
     */
    getPriority(context = {}) {
        // High priority when simplicity is important
        if (context.mobilityConstraints || context.avoidTransfers) {
            return 15;
        }

        return 40;
    }
}

export default FewestTransfersStrategy;