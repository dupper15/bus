import mapBoxFacade from "./MapBoxFacade.js";
import RouteSegment from '@/components/Route/RouteSegment.jsx';
import WalkingSegment from '@/components/Route/WalkingSegment.jsx';
import BusSegment from '@/components/Route/BusSegment.jsx';
import RouteComponent from '@/components/Route/RouteComponent.jsx';

class RoutingService {
    constructor() {
        this.mapBoxFacade = mapBoxFacade;
    }

    async createRoute(startCoords, endCoords, pathData, options = {}) {
        try {
            const components = [];
            const routeName = options.name || `Route ${new Date().toLocaleTimeString()}`;
            const strategy = options.strategy || 'balanced';

            if (pathData && pathData.segments && Array.isArray(pathData.segments)) {
                for (let i = 0; i < pathData.segments.length; i++) {
                    const segmentData = pathData.segments[i];
                    const component = await this.createRouteComponent(segmentData, i, options);

                    if (component && component.isValid()) {
                        components.push(component);
                    }
                }
            }

            const route = new RouteSegment({
                name: routeName,
                components: components,
                strategy: strategy,
                metadata: {
                    ...options.metadata,
                    createdBy: 'RoutingService',
                    pathData: pathData,
                    startCoords: startCoords,
                    endCoords: endCoords
                },
                confidence: this.calculateRouteConfidence(components),
                realTimeUpdates: options.realTimeUpdates || false
            });

            if (!route.isValid()) {
                console.warn('Created route is not valid:', route);
            }

            return route;
        } catch (error) {
            console.error('Error creating route:', error);
            return new RouteSegment({
                name: 'Error Route',
                metadata: { error: error.message }
            });
        }
    }

    async createRouteComponent(segmentData, index, options = {}) {
        try {
            if (segmentData.type === 'walking') {
                return await this.createWalkingSegment(segmentData, options);
            } else if (segmentData.type === 'bus') {
                return await this.createBusSegment(segmentData, options);
            } else {
                console.warn(`Unknown segment type: ${segmentData.type}`);
                return null;
            }
        } catch (error) {
            console.error(`Error creating route component ${index}:`, error);
            return null;
        }
    }

    async createWalkingSegment(segmentData, options = {}) {
        const startPoint = segmentData.from || segmentData.startPoint;
        const endPoint = segmentData.to || segmentData.endPoint;

        let walkingRoute = null;
        let coordinates = segmentData.coordinates || [];
        let distance = segmentData.distance || 0;
        let duration = segmentData.duration || 0;

        try {
            const startCoords = this.extractCoordinates(startPoint);
            const endCoords = this.extractCoordinates(endPoint);

            if (startCoords && endCoords) {
                walkingRoute = await this.getWalkingRoute(startCoords, endCoords);

                if (walkingRoute) {
                    coordinates = walkingRoute.coordinates || coordinates;
                    distance = walkingRoute.distance || distance;
                    duration = walkingRoute.duration || duration;
                }
            }
        } catch (error) {
            console.warn('Could not get enhanced walking route data:', error);
        }

        return new WalkingSegment({
            distance: distance,
            duration: duration,
            startPoint: startPoint,
            endPoint: endPoint,
            coordinates: coordinates,
            path: walkingRoute?.coordinates || [],
            terrain: this.assessTerrain(coordinates),
            sidewalkAvailable: options.sidewalkAvailable !== false,
            accessibilityFeatures: this.assessAccessibility(coordinates, options)
        });
    }

    async createBusSegment(segmentData, options = {}) {
        const startPoint = segmentData.from || segmentData.startPoint;
        const endPoint = segmentData.to || segmentData.endPoint;
        const intermediateStops = segmentData.intermediateStops || segmentData.stops || [];

        let busRoute = null;
        let coordinates = segmentData.coordinates || [];
        let distance = segmentData.distance || 0;
        let duration = segmentData.duration || 0;

        try {
            const allStops = [startPoint, ...intermediateStops, endPoint].filter(Boolean);
            busRoute = await this.getBusRoute(allStops);

            if (busRoute) {
                coordinates = busRoute.coordinates || coordinates;
                distance = busRoute.distance || distance;
                duration = busRoute.duration || duration;
            }
        } catch (error) {
            console.warn('Could not get enhanced bus route data:', error);
        }

        return new BusSegment({
            distance: distance,
            duration: duration,
            startPoint: startPoint,
            endPoint: endPoint,
            coordinates: coordinates,
            busLine: segmentData.line || segmentData.busLine,
            fare: segmentData.fare || this.calculateBusFare(distance),
            intermediateStops: intermediateStops,
            schedule: options.includeSchedule ? this.getBusSchedule(segmentData.line) : null,
            vehicleType: this.determineBusType(segmentData.line),
            accessibility: this.assessBusAccessibility(segmentData.line)
        });
    }

    async findBestRoute(startCoords, endCoords, busStops, busLines, options = {}) {
        try {
            const basicPath = await this.createBasicRoute(startCoords, endCoords, busStops, busLines, options);
            return await this.createRoute(startCoords, endCoords, basicPath, options);
        } catch (error) {
            console.error('Error finding best route:', error);
            return new RouteSegment({
                name: 'Error Route',
                metadata: { error: error.message }
            });
        }
    }

    async createBasicRoute(startCoords, endCoords, busStops, busLines, options = {}) {
        const nearbyStartStops = this.findNearestStops(startCoords, busStops, 1);
        const nearbyEndStops = this.findNearestStops(endCoords, busStops, 1);

        if (nearbyStartStops.length === 0 || nearbyEndStops.length === 0) {
            return {
                segments: [{
                    type: 'walking',
                    from: { name: 'Start', coordinates: startCoords },
                    to: { name: 'End', coordinates: endCoords },
                    distance: this.calculateDistance(startCoords, endCoords),
                    duration: this.estimateTravelTime(this.calculateDistance(startCoords, endCoords), 'walking')
                }],
                totalDistance: this.calculateDistance(startCoords, endCoords),
                totalDuration: this.estimateTravelTime(this.calculateDistance(startCoords, endCoords), 'walking')
            };
        }

        const startStop = nearbyStartStops[0].stop;
        const endStop = nearbyEndStops[0].stop;

        return {
            segments: [
                {
                    type: 'walking',
                    from: { name: 'Start', coordinates: startCoords },
                    to: startStop,
                    distance: nearbyStartStops[0].distance,
                    duration: this.estimateTravelTime(nearbyStartStops[0].distance, 'walking')
                },
                {
                    type: 'bus',
                    from: startStop,
                    to: endStop,
                    line: this.findBusLineConnecting(startStop, endStop, busLines),
                    distance: this.calculateDistance([startStop.pointX, startStop.pointY], [endStop.pointX, endStop.pointY]),
                    duration: this.estimateTravelTime(this.calculateDistance([startStop.pointX, startStop.pointY], [endStop.pointX, endStop.pointY]), 'bus')
                },
                {
                    type: 'walking',
                    from: endStop,
                    to: { name: 'End', coordinates: endCoords },
                    distance: nearbyEndStops[0].distance,
                    duration: this.estimateTravelTime(nearbyEndStops[0].distance, 'walking')
                }
            ]
        };
    }

    calculateRouteConfidence(components) {
        if (!components || components.length === 0) return 0.0;

        let totalConfidence = 0;
        let validComponents = 0;

        components.forEach(component => {
            if (component.isValid()) {
                validComponents++;

                let componentConfidence = 0.8;

                if (component instanceof BusSegment) {
                    componentConfidence += 0.1;
                }

                if (component instanceof WalkingSegment && component.getDistance() > 2) {
                    componentConfidence -= 0.2;
                }

                totalConfidence += Math.max(0, Math.min(1, componentConfidence));
            }
        });

        return validComponents > 0 ? totalConfidence / validComponents : 0.0;
    }

    assessTerrain(coordinates) {
        if (!coordinates || coordinates.length < 2) return 'flat';

        return 'flat';
    }

    assessAccessibility(coordinates, options = {}) {
        const features = [];

        if (options.requireAccessible) {
            features.push('wheelchair accessible');
        }

        return features;
    }

    calculateBusFare(distance) {
        return 6000;
    }

    getBusSchedule(busLine) {
        return {
            frequency: '10-15 minutes',
            operatingHours: '5:00 AM - 11:00 PM',
            nextBuses: [5, 12, 27]
        };
    }

    determineBusType(busLine) {
        if (!busLine || !busLine.name) return 'standard';

        if (busLine.name.includes('Express') || busLine.name.includes('BRT')) {
            return 'express';
        }

        return 'standard';
    }

    assessBusAccessibility(busLine) {
        const features = [];

        features.push('wheelchair accessible', 'low floor');

        if (busLine && busLine.name && busLine.name.includes('BRT')) {
            features.push('level boarding', 'audio announcements');
        }

        return features;
    }

    findBusLineConnecting(startStop, endStop, busLines) {
        for (let line of busLines) {
            if (line.arr_stop && Array.isArray(line.arr_stop)) {
                const hasStartStop = line.arr_stop.some(stop =>
                    stop.id === startStop.id || stop.name === startStop.name
                );
                const hasEndStop = line.arr_stop.some(stop =>
                    stop.id === endStop.id || stop.name === endStop.name
                );

                if (hasStartStop && hasEndStop) {
                    return line;
                }
            }
        }

        return { name: 'Bus Line', id: 'generic' };
    }

    findNearestStops(coordinates, busStops, maxDistance = 1) {
        const nearbyStops = [];
        const searchCoords = RouteComponent.ensureLngLat(coordinates);

        if (!searchCoords) return nearbyStops;

        busStops.forEach((stop) => {
            const stopCoords = this.extractCoordinates(stop);
            if (stopCoords) {
                const distance = this.calculateDistance(searchCoords, stopCoords);
                if (distance <= maxDistance) {
                    nearbyStops.push({ stop, distance });
                }
            }
        });

        return nearbyStops.sort((a, b) => a.distance - b.distance);
    }

    calculateDistance(coord1, coord2) {
        const c1 = RouteComponent.ensureLngLat(coord1);
        const c2 = RouteComponent.ensureLngLat(coord2);

        if (!c1 || !c2) return 0;

        const [lng1, lat1] = c1;
        const [lng2, lat2] = c2;

        const R = 6371;
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    async getWalkingRoute(startCoords, endCoords) {
        try {
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
                    distance: route.distance / 1000,
                    duration: route.duration / 60
                };
            }
        } catch (error) {
            console.error('Error getting walking route:', error);
        }

        const distance = this.calculateDistance(startCoords, endCoords);
        return {
            coordinates: [startCoords, endCoords],
            distance: distance,
            duration: distance / 5 * 60
        };
    }

    async getBusRoute(stops) {
        try {
            const coordinates = stops.map(stop => {
                const coords = this.extractCoordinates(stop);
                return RouteComponent.ensureLngLat(coords);
            }).filter(coords => coords !== null);

            console.log('Bus route coordinates:', coordinates);

            const directionsData = await this.mapBoxFacade.getDirections(coordinates, 'driving');

            if (directionsData.routes && directionsData.routes.length > 0) {
                const route = directionsData.routes[0];
                return {
                    coordinates: route.geometry.coordinates,
                    distance: route.distance / 1000,
                    duration: route.duration / 60
                };
            }
        } catch (error) {
            console.error('Error getting bus route:', error);
        }

        return null;
    }

    extractCoordinates(location) {
        if (!location) return null;

        let coords = null;

        if (Array.isArray(location) && location.length >= 2) {
            coords = [location[0], location[1]];
        }
        else if (location.pointX !== undefined && location.pointY !== undefined) {
            coords = [location.pointX, location.pointY];
        }
        else if (location.lng !== undefined && location.lat !== undefined) {
            coords = [location.lng, location.lat];
        }
        else if (location.longitude !== undefined && location.latitude !== undefined) {
            coords = [location.longitude, location.latitude];
        }
        else if (location.coordinates && Array.isArray(location.coordinates)) {
            coords = this.extractCoordinates(location.coordinates);
        }

        if (coords) {
            const standardized = RouteComponent.ensureLngLat(coords);
            return RouteComponent.validateCoordinates(standardized) ? standardized : null;
        }

        return null;
    }

    estimateTravelTime(distance, mode = 'walking') {
        const speeds = {
            walking: 5,
            bus: 20,
            transfer: 5
        };

        if (mode === 'transfer') {
            return speeds.transfer;
        }

        return (distance / speeds[mode]) * 60;
    }

    getRouteSummary(route) {
        if (!(route instanceof RouteSegment)) {
            return null;
        }

        return route.getSummary();
    }

    validateRoute(route, constraints = {}) {
        if (!(route instanceof RouteSegment)) {
            return false;
        }

        return route.isValid();
    }
}

const routingService = new RoutingService();
export default routingService;