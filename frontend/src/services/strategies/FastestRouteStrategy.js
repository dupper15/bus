import PathfindingStrategy from './PathfindingStrategy.js';
import RouteSegment from '@/components/Route/RouteSegment.jsx';
import routingService from '@/services/RoutingService.js';

class FastestRouteStrategy extends PathfindingStrategy {
    constructor() {
        super(
            'Fastest Route',
            '⚡',
            'Finds the quickest route using line.time, prioritizing speed over transfers'
        );
    }

    async findPath(startCoords, endCoords, busStops, busLines) {
        try {
            const nearbyStartStops = this.findNearbyStops(startCoords, busStops, 1.5);
            const nearbyEndStops = this.findNearbyStops(endCoords, busStops, 1.5);

            if (nearbyStartStops.length === 0 || nearbyEndStops.length === 0) {
                return this.createWalkingResult(startCoords, endCoords);
            }

            let fastestRoute = null;
            let shortestTime = Infinity;

            // Try direct routes first
            for (let startStopData of nearbyStartStops) {
                for (let endStopData of nearbyEndStops) {
                    const directRoute = await this.createDirectRoute(
                        startCoords, endCoords,
                        startStopData, endStopData, busLines
                    );

                    if (directRoute) {
                        const totalTime = this.calculateTotalTime(directRoute);
                        if (totalTime < shortestTime) {
                            shortestTime = totalTime;
                            fastestRoute = directRoute;
                        }
                    }
                }
            }

            // Try transfer routes if they're faster
            for (let startStopData of nearbyStartStops.slice(0, 3)) {
                for (let endStopData of nearbyEndStops.slice(0, 3)) {
                    const transferRoute = await this.createTransferRoute(
                        startCoords, endCoords,
                        startStopData, endStopData, busStops, busLines
                    );

                    if (transferRoute) {
                        const totalTime = this.calculateTotalTime(transferRoute);
                        if (totalTime < shortestTime) {
                            shortestTime = totalTime;
                            fastestRoute = transferRoute;
                        }
                    }
                }
            }

            if (!fastestRoute) {
                return this.createWalkingResult(startCoords, endCoords);
            }

            return {
                path: fastestRoute,
                metadata: this.createMetadata(fastestRoute, {
                    strategy: 'fastest',
                    totalTime: shortestTime
                })
            };

        } catch (error) {
            console.error('Error in FastestRouteStrategy:', error);
            return this.createWalkingResult(startCoords, endCoords);
        }
    }

    async createDirectRoute(startCoords, endCoords, startStopData, endStopData, busLines) {
        const connections = this.findDirectConnections(startStopData.stop, endStopData.stop, busLines);

        if (connections.length === 0) return null;

        // Sort by line.time (fastest first)
        connections.sort((a, b) => (a.line.time || 60) - (b.line.time || 60));

        const bestConnection = connections[0];
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
            bestConnection.line,
            bestConnection.intermediateStops
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

    async createTransferRoute(startCoords, endCoords, startStopData, endStopData, busStops, busLines) {
        const transferPoints = this.findTransferHubs(busStops, busLines).slice(0, 3);

        let fastestTransferRoute = null;
        let shortestTransferTime = Infinity;

        for (let transferPoint of transferPoints) {
            // First leg connections
            const firstLegConnections = this.findDirectConnections(startStopData.stop, transferPoint, busLines);
            if (firstLegConnections.length === 0) continue;

            // Second leg connections
            const secondLegConnections = this.findDirectConnections(transferPoint, endStopData.stop, busLines);
            if (secondLegConnections.length === 0) continue;

            // Find fastest combination
            for (let firstLeg of firstLegConnections.slice(0, 2)) {
                for (let secondLeg of secondLegConnections.slice(0, 2)) {
                    const route = await this.buildTransferRoute(
                        startCoords, endCoords,
                        startStopData.stop, transferPoint, endStopData.stop,
                        firstLeg, secondLeg
                    );

                    if (route) {
                        const totalTime = this.calculateTotalTime(route);
                        if (totalTime < shortestTransferTime) {
                            shortestTransferTime = totalTime;
                            fastestTransferRoute = route;
                        }
                    }
                }
            }
        }

        return fastestTransferRoute;
    }

    async buildTransferRoute(startCoords, endCoords, startStop, transferStop, endStop, firstLeg, secondLeg) {
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
            firstLeg.line,
            firstLeg.intermediateStops
        );
        if (firstBusSegment) segments.push(firstBusSegment);

        // Second bus segment
        const secondBusSegment = await this.createBusSegmentWithLineTime(
            transferStop,
            endStop,
            secondLeg.line,
            secondLeg.intermediateStops
        );
        if (secondBusSegment) segments.push(secondBusSegment);

        // Walking from end
        const walkFromEnd = await this.createWalkingSegment(
            endStop,
            { name: 'Destination', coordinates: endCoords }
        );
        if (walkFromEnd) segments.push(walkFromEnd);

        return this.createRoute(segments, {
            routeType: 'transfer',
            transfers: 1
        });
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

    calculateTotalTime(route) {
        if (!route || !route.getComponents) return Infinity;

        return route.getComponents().reduce((total, segment) => {
            return total + (segment.duration || 0);
        }, 0);
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
                strategy: 'fastest',
                fallback: 'walking-only'
            })
        };
    }

    createMetadata(route, additionalData = {}) {
        return {
            strategy: this.type,
            strategyName: this.name,
            score: this.calculateTotalTime(route),
            transfers: route.getTransferCount(),
            totalDuration: this.calculateTotalTime(route),
            optimizationFactor: 'time',
            ...additionalData
        };
    }
}

export default FastestRouteStrategy;