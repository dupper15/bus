import RouteSegment from '@/components/Route/RouteSegment.jsx';
import WalkingSegment from '@/components/Route/WalkingSegment.jsx';
import BusSegment from '@/components/Route/BusSegment.jsx';
import RouteComponent from '@/components/Route/RouteComponent.jsx';
import routingService from '@/services/RoutingService.js';

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

    async findPath(startCoords, endCoords, busStops, busLines) {
        throw new Error("findPath() must be implemented by concrete strategy classes");
    }

    createRoute(segments, metadata = {}) {
        try {
            const components = segments.map((segment, index) => {
                return this.createRouteComponent(segment, index);
            }).filter(component => component !== null);

            const route = new RouteSegment({
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
            return new RouteSegment({
                name: 'Error Route',
                strategy: this.type,
                metadata: { error: error.message }
            });
        }
    }

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
    findNearbyStops(coordinates, busStops, maxDistance = 1) {
        return routingService.findNearestStops(coordinates, busStops, maxDistance);
    }

    calculateDistance(coord1, coord2) {
        return routingService.calculateDistance(coord1, coord2);
    }

    estimateTravelTime(distance, mode = 'walking') {
        return routingService.estimateTravelTime(distance, mode);
    }

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

    getIntermediateStops(allStops, startIndex, endIndex) {
        if (startIndex < endIndex) {
            return allStops.slice(startIndex + 1, endIndex);
        } else {
            return [
                ...allStops.slice(startIndex + 1),
                ...allStops.slice(0, endIndex)
            ];
        }
    }

    async createWalkingSegment(from, to, options = {}) {
        const fromCoords = this.extractCoordinates(from);
        const toCoords = this.extractCoordinates(to);

        if (!fromCoords || !toCoords) {
            return null;
        }

        const distance = this.calculateDistance(fromCoords, toCoords);
        const duration = this.estimateTravelTime(distance, 'walking');

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
    extractCoordinates(location) {
        const coords = routingService.extractCoordinates(location);
        return coords ? RouteComponent.ensureLngLat(coords) : null;
    }
    getInfo() {
        return {
            name: this.name,
            icon: this.icon,
            type: this.type,
            description: this.description
        };
    }

    getExplanation() {
        return this.description;
    }

    isSuitableFor(conditions = {}) {
        return true;
    }

    getPriority(context = {}) {
        return 100;
    }
}

export default PathfindingStrategy;