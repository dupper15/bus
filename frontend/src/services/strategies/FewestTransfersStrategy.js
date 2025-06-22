import PathfindingStrategy from './PathfindingStrategy.js';
import Route from '@/components/Route/Route.jsx';
import routingService from '@/services/RoutingService.js';

class FewestTransfersStrategy extends PathfindingStrategy {
    constructor() {
        super(
            'Fewest Transfers',
            '🎯',
            'Minimizes transfers by choosing longer direct routes, prioritizing convenience over speed'
        );
    }

    async findPath(startCoords, endCoords, busStops, busLines) {
        try {
            const nearbyStartStops = this.findNearbyStops(startCoords, busStops, 1.5);
            const nearbyEndStops = this.findNearbyStops(endCoords, busStops, 1.5);

            if (nearbyStartStops.length === 0 || nearbyEndStops.length === 0) {
                return this.createWalkingResult(startCoords, endCoords);
            }

            // Priority 1: Try to find any direct route (0 transfers)
            const directRoute = await this.findBestDirectRoute(
                startCoords, endCoords,
                nearbyStartStops, nearbyEndStops, busLines
            );

            if (directRoute) {
                return {
                    path: directRoute,
                    metadata: this.createMetadata(directRoute, {
                        strategy: 'fewest-transfers',
                        transfers: 0,
                        routeType: 'direct'
                    })
                };
            }

            // Priority 2: Single transfer route (1 transfer) - only if no direct route exists
            const transferRoute = await this.findBestTransferRoute(
                startCoords, endCoords,
                nearbyStartStops, nearbyEndStops, busStops, busLines
            );

            if (transferRoute) {
                return {
                    path: transferRoute,
                    metadata: this.createMetadata(transferRoute, {
                        strategy: 'fewest-transfers',
                        transfers: 1,
                        routeType: 'single-transfer'
                    })
                };
            }

            // Fallback to walking
            return this.createWalkingResult(startCoords, endCoords);

        } catch (error) {
            console.error('Error in FewestTransfersStrategy:', error);
            return this.createWalkingResult(startCoords, endCoords);
        }
    }

    async findBestDirectRoute(startCoords, endCoords, nearbyStartStops, nearbyEndStops, busLines) {
        let bestRoute = null;
        let bestScore = Infinity;

        for (let startStopData of nearbyStartStops) {
            for (let endStopData of nearbyEndStops) {
                const connections = this.findDirectConnections(startStopData.stop, endStopData.stop, busLines);

                for (let connection of connections) {
                    const route = await this.createDirectRoute(
                        startCoords, endCoords,
                        startStopData, endStopData, connection
                    );

                    if (route) {
                        const score = this.calculateDirectRouteScore(route, startStopData.distance, endStopData.distance);
                        if (score < bestScore) {
                            bestScore = score;
                            bestRoute = route;
                        }
                    }
                }
            }
        }

        return bestRoute;
    }

    async findBestTransferRoute(startCoords, endCoords, nearbyStartStops, nearbyEndStops, busStops, busLines) {
        const transferPoints = this.findTransferHubs(busStops, busLines).slice(0, 5);

        let bestRoute = null;
        let bestScore = Infinity;

        for (let startStopData of nearbyStartStops.slice(0, 3)) {
            for (let endStopData of nearbyEndStops.slice(0, 3)) {
                for (let transferPoint of transferPoints) {
                    const route = await this.createSingleTransferRoute(
                        startCoords, endCoords,
                        startStopData.stop, transferPoint, endStopData.stop,
                        busLines
                    );

                    if (route) {
                        const score = this.calculateTransferRouteScore(route, startStopData.distance, endStopData.distance);
                        if (score < bestScore) {
                            bestScore = score;
                            bestRoute = route;
                        }
                    }
                }
            }
        }

        return bestRoute;
    }

    async createDirectRoute(startCoords, endCoords, startStopData, endStopData, connection) {
        const segments = [];

        // Walking to start
        const walkToStart = await this.createWalkingSegment(
            { name: 'Start', coordinates: startCoords },
            startStopData.stop
        );
        if (walkToStart) segments.push(walkToStart);

        // Bus segment using line.time
        const busSegment = await this.createBusSegmentWithLineTime(
            startStopData.stop,
            endStopData.stop,
            connection.line,
            connection.intermediateStops
        );
        if (busSegment) segments.push(busSegment);

        // Walking from end
        const walkFromEnd = await this.createWalkingSegment(
            endStopData.stop,
            { name: 'Destination', coordinates: endCoords }
        );
        if (walkFromEnd) segments.push(walkFromEnd);

        return this.createRoute(segments, {
            routeType: 'direct',
            transfers: 0
        });
    }

    async createSingleTransferRoute(startCoords, endCoords, startStop, transferStop, endStop, busLines) {
        // Find best first leg (prefer longer routes with line.time)
        const firstLegConnections = this.findDirectConnections(startStop, transferStop, busLines);
        if (firstLegConnections.length === 0) return null;

        // Find best second leg
        const secondLegConnections = this.findDirectConnections(transferStop, endStop, busLines);
        if (secondLegConnections.length === 0) return null;

        // Choose connections that minimize total time (using line.time)
        const bestFirstLeg = this.selectBestConnection(firstLegConnections);
        const bestSecondLeg = this.selectBestConnection(secondLegConnections);

        const segments = [];

        // Walking to start
        const walkToStart = await this.createWalkingSegment(
            { name: 'Start', coordinates: startCoords },
            startStop
        );
        if (walkToStart) segments.push(walkToStart);

        // First bus segment
        const firstBusSegment = await this.createBusSegmentWithLineTime(
            startStop,
            transferStop,
            bestFirstLeg.line,
            bestFirstLeg.intermediateStops
        );
        if (firstBusSegment) segments.push(firstBusSegment);

        // Second bus segment
        const secondBusSegment = await this.createBusSegmentWithLineTime(
            transferStop,
            endStop,
            bestSecondLeg.line,
            bestSecondLeg.intermediateStops
        );
        if (secondBusSegment) segments.push(secondBusSegment);

        // Walking from end
        const walkFromEnd = await this.createWalkingSegment(
            endStop,
            { name: 'Destination', coordinates: endCoords }
        );
        if (walkFromEnd) segments.push(walkFromEnd);

        return this.createRoute(segments, {
            routeType: 'single-transfer',
            transfers: 1
        });
    }

    selectBestConnection(connections) {
        if (connections.length === 1) return connections[0];

        // For fewest transfers, prefer lines with shorter time (more efficient long routes)
        return connections.sort((a, b) => {
            const timeA = a.line.time || 60;
            const timeB = b.line.time || 60;
            return timeA - timeB;
        })[0];
    }

    async createBusSegmentWithLineTime(from, to, line, intermediateStops = []) {
        const fromCoords = this.extractCoordinates(from);
        const toCoords = this.extractCoordinates(to);

        if (!fromCoords || !toCoords) return null;

        const distance = this.calculateDistance(fromCoords, toCoords);
        // Use line.time directly, fallback to distance-based calculation
        let duration = line.time || this.estimateTravelTime(distance, 'bus');

        // Adjust for partial route (proportional to total line)
        if (line.arr_stop && line.arr_stop.length > 2) {
            const proportionOfLine = (intermediateStops.length + 1) / (line.arr_stop.length - 1);
            duration = duration * proportionOfLine;
        }

        // Get enhanced bus route if possible (actual path, not beeline)
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
            duration: Math.round(duration),
            coordinates: coordinates,
            intermediateStops: intermediateStops,
            fare: 6000
        };
    }

    // Simple implementation of transfer hub finding
    findTransferHubs(busStops, busLines) {
        const stopConnections = new Map();

        // Count how many lines pass through each stop
        for (let line of busLines) {
            if (line.arr_stop) {
                for (let stop of line.arr_stop) {
                    const stopId = stop.id || stop.name || JSON.stringify(stop);
                    if (!stopConnections.has(stopId)) {
                        stopConnections.set(stopId, { stop: stop, lineCount: 0 });
                    }
                    stopConnections.get(stopId).lineCount++;
                }
            }
        }

        // Return stops with most connections (best transfer hubs)
        return Array.from(stopConnections.values())
            .sort((a, b) => b.lineCount - a.lineCount)
            .slice(0, 10)
            .map(item => item.stop);
    }

    calculateDirectRouteScore(route, walkToStartDistance, walkFromEndDistance) {
        // For fewest transfers, minimize walking distance (prioritize direct routes)
        const totalWalking = walkToStartDistance + walkFromEndDistance;
        const busDuration = this.getBusDuration(route);

        // Heavily weight walking distance to prefer direct routes
        return (totalWalking * 20) + (busDuration * 0.1);
    }

    calculateTransferRouteScore(route, walkToStartDistance, walkFromEndDistance) {
        // Only consider transfer routes if no direct route exists
        // Score based on total time and walking
        const totalWalking = walkToStartDistance + walkFromEndDistance;
        const totalDuration = this.getTotalDuration(route);

        // Heavy penalty for being a transfer route, but still score them for comparison
        return 100 + (totalWalking * 10) + (totalDuration * 0.5);
    }

    getBusDuration(route) {
        if (!route || !route.getComponents) return 0;

        return route.getComponents()
            .filter(segment => segment.type === 'bus')
            .reduce((total, segment) => total + (segment.duration || 0), 0);
    }

    getTotalDuration(route) {
        if (!route || !route.getComponents) return 0;

        return route.getComponents()
            .reduce((total, segment) => total + (segment.duration || 0), 0);
    }

    async createWalkingResult(startCoords, endCoords) {
        const walkingSegment = await this.createWalkingSegment(
            { name: 'Start', coordinates: startCoords },
            { name: 'Destination', coordinates: endCoords }
        );

        const walkingRoute = this.createRoute([walkingSegment], {
            routeType: 'walking-only',
            transfers: 0
        });

        return {
            path: walkingRoute,
            metadata: this.createMetadata(walkingRoute, {
                strategy: 'fewest-transfers',
                fallback: 'walking-only'
            })
        };
    }

    createMetadata(route, additionalData = {}) {
        return {
            strategy: this.type,
            strategyName: this.name,
            score: route.getTransferCount() * 100 + this.getTotalDuration(route) * 0.1,
            transfers: route.getTransferCount(),
            totalDuration: this.getTotalDuration(route),
            optimizationFactor: 'transfers',
            ...additionalData
        };
    }
}

export default FewestTransfersStrategy;