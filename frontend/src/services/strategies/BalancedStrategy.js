import PathfindingStrategy from './PathfindingStrategy.js';
import Route from '@/components/Route/Route.jsx';
import routingService from '@/services/RoutingService.js';

class BalancedStrategy extends PathfindingStrategy {
    constructor() {
        super(
            'Balanced Route',
            '⚖️',
            'Balances time, transfers, and walking distance for a practical route'
        );
    }

    async findPath(startCoords, endCoords, busStops, busLines) {
        try {
            const nearbyStartStops = this.findNearbyStops(startCoords, busStops, 1.5);
            const nearbyEndStops = this.findNearbyStops(endCoords, busStops, 1.5);

            if (nearbyStartStops.length === 0 || nearbyEndStops.length === 0) {
                return this.createWalkingResult(startCoords, endCoords);
            }

            let bestRoute = null;
            let bestScore = Infinity;

            // Try direct routes
            for (let startStopData of nearbyStartStops) {
                for (let endStopData of nearbyEndStops) {
                    const directRoute = await this.createDirectRoute(
                        startCoords, endCoords,
                        startStopData, endStopData, busLines
                    );

                    if (directRoute) {
                        const score = this.calculateBalancedScore(directRoute, startStopData.distance, endStopData.distance);
                        if (score < bestScore) {
                            bestScore = score;
                            bestRoute = directRoute;
                        }
                    }
                }
            }

            // Try transfer routes
            for (let startStopData of nearbyStartStops.slice(0, 3)) {
                for (let endStopData of nearbyEndStops.slice(0, 3)) {
                    const transferRoute = await this.createTransferRoute(
                        startCoords, endCoords,
                        startStopData, endStopData, busStops, busLines
                    );

                    if (transferRoute) {
                        const score = this.calculateBalancedScore(transferRoute, startStopData.distance, endStopData.distance);
                        if (score < bestScore) {
                            bestScore = score;
                            bestRoute = transferRoute;
                        }
                    }
                }
            }

            if (!bestRoute) {
                return this.createWalkingResult(startCoords, endCoords);
            }

            return {
                path: bestRoute,
                metadata: this.createMetadata(bestRoute, {
                    strategy: 'balanced',
                    score: bestScore
                })
            };

        } catch (error) {
            console.error('Error in BalancedStrategy:', error);
            return this.createWalkingResult(startCoords, endCoords);
        }
    }

    async createDirectRoute(startCoords, endCoords, startStopData, endStopData, busLines) {
        const connections = this.findDirectConnections(startStopData.stop, endStopData.stop, busLines);

        if (connections.length === 0) return null;

        // Sort by line.time (prefer faster lines)
        connections.sort((a, b) => (a.line.time || 60) - (b.line.time || 60));

        const bestConnection = connections[0];
        const segments = [];

        // Walking to start
        const walkToStart = await this.createWalkingSegment(
            { name: 'Start', coordinates: startCoords },
            startStopData.stop
        );
        if (walkToStart) segments.push(walkToStart);

        // Bus segment
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

        let bestTransferRoute = null;
        let bestTransferScore = Infinity;

        for (let transferPoint of transferPoints) {
            const firstLegConnections = this.findDirectConnections(startStopData.stop, transferPoint, busLines);
            if (firstLegConnections.length === 0) continue;

            const secondLegConnections = this.findDirectConnections(transferPoint, endStopData.stop, busLines);
            if (secondLegConnections.length === 0) continue;

            // Try combinations - take best from each leg
            const bestFirstLeg = firstLegConnections.sort((a, b) => (a.line.time || 60) - (b.line.time || 60))[0];
            const bestSecondLeg = secondLegConnections.sort((a, b) => (a.line.time || 60) - (b.line.time || 60))[0];

            const route = await this.buildTransferRoute(
                startCoords, endCoords,
                startStopData.stop, transferPoint, endStopData.stop,
                bestFirstLeg, bestSecondLeg
            );

            if (route) {
                const score = this.calculateBalancedScore(route, startStopData.distance, endStopData.distance);
                if (score < bestTransferScore) {
                    bestTransferScore = score;
                    bestTransferRoute = route;
                }
            }
        }

        return bestTransferRoute;
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
        let duration = line.time || this.estimateTravelTime(distance, 'bus');

        if (line.arr_stop && line.arr_stop.length > 2) {
            const proportionOfLine = (intermediateStops.length + 1) / (line.arr_stop.length - 1);
            duration = duration * proportionOfLine;
        }

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
            duration: Math.round(duration),
            coordinates: coordinates,
            intermediateStops: intermediateStops,
            fare: 6000
        };
    }

    findTransferHubs(busStops, busLines) {
        const stopConnections = new Map();

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

        return Array.from(stopConnections.values())
            .sort((a, b) => b.lineCount - a.lineCount)
            .slice(0, 10)
            .map(item => item.stop);
    }

    calculateBalancedScore(route, walkToStartDistance, walkFromEndDistance) {
        const weights = {
            time: 1.0,           // Total route time
            transfers: 15.0,     // Transfers penalty (moderate)
            walking: 8.0,        // Walking distance penalty
            stops: 0.5,          // Bus stops penalty (more stops = slower)
            stations: -3.0       // Station bonus (isStation = true)
        };

        const time = this.getTotalDuration(route);
        const transfers = route.getTransferCount();
        const walking = walkToStartDistance + walkFromEndDistance;
        const stops = this.countBusStops(route);
        const stations = this.countStations(route);

        return (time * weights.time) +
            (transfers * weights.transfers) +
            (walking * weights.walking) +
            (stops * weights.stops) +
            (stations * weights.stations);
    }

    getTotalDuration(route) {
        if (!route || !route.getComponents) return 0;

        return route.getComponents()
            .reduce((total, segment) => total + (segment.duration || 0), 0);
    }

    countBusStops(route) {
        if (!route || !route.getComponents) return 0;

        return route.getComponents()
            .filter(segment => segment.type === 'bus')
            .reduce((total, segment) => total + (segment.intermediateStops?.length || 0), 0);
    }

    countStations(route) {
        if (!route || !route.getComponents) return 0;

        let stationCount = 0;
        route.getComponents()
            .filter(segment => segment.type === 'bus')
            .forEach(segment => {
                if (segment.from?.isStation) stationCount++;
                if (segment.to?.isStation) stationCount++;
                if (segment.intermediateStops) {
                    stationCount += segment.intermediateStops.filter(stop => stop.isStation).length;
                }
            });

        return stationCount;
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
                strategy: 'balanced',
                fallback: 'walking-only'
            })
        };
    }

    createMetadata(route, additionalData = {}) {
        const balancedScore = additionalData.score || this.calculateBalancedScore(route, 0, 0);

        return {
            strategy: this.type,
            strategyName: this.name,
            score: balancedScore,
            transfers: route.getTransferCount(),
            totalDuration: this.getTotalDuration(route),
            optimizationFactor: 'balanced',
            ...additionalData
        };
    }
}

export default BalancedStrategy;