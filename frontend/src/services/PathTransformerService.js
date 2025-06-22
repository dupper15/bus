import Route from '@/components/Route/Route.jsx';
import WalkingSegment from '@/components/Route/WalkingSegment.jsx';
import BusSegment from '@/components/Route/BusSegment.jsx';

class PathTransformerService {
    transformForMapView(strategyPath) {
        if (strategyPath instanceof Route) {
            return this.transformRouteForMapView(strategyPath);
        }

        if (Array.isArray(strategyPath) && strategyPath.length > 0) {
            return this.transformLegacyPathForMapView(strategyPath);
        }

        return [];
    }

    transformRouteForMapView(route) {
        if (!route || !route.isValid()) {
            return [];
        }

        const components = route.getComponents();
        return components.map((component, index) => {
            const baseSegment = {
                type: component.getType(),
                coords: component.getCoordinates(),
                distance: component.getDistance(),
                duration: component.getDuration(),
                from: component.getStartPoint(),
                to: component.getEndPoint()
            };

            if (component instanceof BusSegment) {
                baseSegment.line = component.getBusLine();
                baseSegment.fare = component.getCost();
                baseSegment.stops = component.getAllStops();
                baseSegment.intermediateStops = component.getAllStops();
            } else if (component instanceof WalkingSegment) {
                const summary = component.getSummary();
                baseSegment.terrain = summary.terrain;
                baseSegment.accessibility = summary.accessibilityFeatures;
            }

            return baseSegment;
        }).filter(segment => segment.coords && segment.coords.length > 0);
    }

    transformLegacyPathForMapView(legacyPath) {
        return legacyPath.map((segment, index) => {
            const transformedSegment = {
                type: segment.type || 'walking',
                coords: segment.coordinates || segment.coords || [],
                distance: segment.distance || 0,
                duration: segment.duration || 0
            };

            if (segment.type === 'bus') {
                transformedSegment.line = segment.line;
                transformedSegment.from = segment.from;
                transformedSegment.fare = segment.fare || 6000;

                if (segment.intermediateStops && Array.isArray(segment.intermediateStops)) {
                    transformedSegment.to = segment.intermediateStops;
                    transformedSegment.stops = segment.intermediateStops;
                } else if (segment.stops && Array.isArray(segment.stops)) {
                    transformedSegment.to = segment.stops;
                    transformedSegment.stops = segment.stops;
                } else if (segment.to) {
                    transformedSegment.to = Array.isArray(segment.to) ? segment.to : [segment.to];
                    transformedSegment.stops = transformedSegment.to;
                }
            } else {
                transformedSegment.from = segment.from;
                transformedSegment.to = segment.to;
            }

            if (!transformedSegment.coords || transformedSegment.coords.length === 0) {
                transformedSegment.coords = this.generateFallbackCoords(segment);
            }

            return transformedSegment;
        }).filter(segment => segment.coords && segment.coords.length > 0);
    }

    transformToRoute(legacyPath, options = {}) {
        if (!Array.isArray(legacyPath) || legacyPath.length === 0) {
            return new Route({ name: 'Empty Route' });
        }

        const components = [];

        legacyPath.forEach((segmentData, index) => {
            try {
                let component;

                if (segmentData.type === 'walking') {
                    component = new WalkingSegment({
                        distance: segmentData.distance || 0,
                        duration: segmentData.duration || 0,
                        startPoint: segmentData.from,
                        endPoint: segmentData.to,
                        coordinates: segmentData.coords || segmentData.coordinates || [],
                        terrain: segmentData.terrain || 'flat',
                        sidewalkAvailable: segmentData.sidewalkAvailable !== false,
                        accessibilityFeatures: segmentData.accessibilityFeatures || []
                    });
                } else if (segmentData.type === 'bus') {
                    component = new BusSegment({
                        distance: segmentData.distance || 0,
                        duration: segmentData.duration || 0,
                        startPoint: segmentData.from,
                        endPoint: segmentData.to,
                        coordinates: segmentData.coords || segmentData.coordinates || [],
                        busLine: segmentData.line,
                        fare: segmentData.fare || 6000,
                        intermediateStops: segmentData.intermediateStops || segmentData.stops || [],
                        vehicleType: segmentData.vehicleType || 'standard',
                        accessibility: segmentData.accessibility || []
                    });
                }

                if (component && component.isValid()) {
                    components.push(component);
                } else {
                    console.warn(`Invalid component created from segment ${index}:`, segmentData);
                }
            } catch (error) {
                console.error(`Error creating component from segment ${index}:`, error, segmentData);
            }
        });

        return new Route({
            name: options.name || 'Transformed Route',
            components: components,
            strategy: options.strategy || 'balanced',
            metadata: options.metadata || {}
        });
    }

    transformFromRoute(route) {
        if (!(route instanceof Route)) {
            return [];
        }

        const components = route.getComponents();
        return components.map(component => {
            const legacySegment = {
                type: component.getType(),
                distance: component.getDistance(),
                duration: component.getDuration(),
                from: component.getStartPoint(),
                to: component.getEndPoint(),
                coordinates: component.getCoordinates(),
                coords: component.getCoordinates()
            };

            if (component instanceof BusSegment) {
                legacySegment.line = component.getBusLine();
                legacySegment.fare = component.getCost();
                legacySegment.intermediateStops = component.getAllStops();
                legacySegment.stops = component.getAllStops();

                const summary = component.getSummary();
                legacySegment.vehicleType = summary.vehicleType;
                legacySegment.accessibility = summary.accessibility;
            } else if (component instanceof WalkingSegment) {
                const summary = component.getSummary();
                legacySegment.terrain = summary.terrain;
                legacySegment.sidewalkAvailable = summary.sidewalkAvailable;
                legacySegment.accessibilityFeatures = summary.accessibilityFeatures;
            }

            return legacySegment;
        });
    }

    createRouteFromMapView(mapViewPath, options = {}) {
        if (!Array.isArray(mapViewPath)) {
            return new Route({ name: 'Empty Route' });
        }

        const legacyPath = mapViewPath.map(segment => ({
            type: segment.type,
            distance: segment.distance,
            duration: segment.duration,
            from: segment.from,
            to: Array.isArray(segment.to) ? segment.to[segment.to.length - 1] : segment.to,
            coordinates: segment.coords,
            line: segment.line,
            fare: segment.fare,
            intermediateStops: segment.stops || segment.intermediateStops
        }));

        return this.transformToRoute(legacyPath, options);
    }

    optimizeRoute(route, strategy = 'balanced') {
        if (!(route instanceof Route)) {
            return route;
        }

        const optimizedRoute = route.clone();
        optimizedRoute.strategy = strategy;

        switch (strategy) {
            case 'fastest':
                this.optimizeForSpeed(optimizedRoute);
                break;
            case 'shortest':
                this.optimizeForDistance(optimizedRoute);
                break;
            case 'fewest-transfers':
                this.optimizeForTransfers(optimizedRoute);
                break;
            case 'minimal-walking':
                this.optimizeForWalking(optimizedRoute);
                break;
            default:
                this.optimizeBalanced(optimizedRoute);
        }

        return optimizedRoute;
    }

    optimizeForSpeed(route) {
        const components = route.getComponents();

        components.forEach(component => {
            if (component instanceof BusSegment) {
                component.vehicleType = 'express';
            }
        });
    }

    optimizeForDistance(route) {
    }

    optimizeForTransfers(route) {
    }

    optimizeForWalking(route) {
    }

    optimizeBalanced(route) {
    }

    generateFallbackCoords(segment) {
        const fromCoords = this.extractCoordinates(segment.from);
        const toCoords = this.extractCoordinates(segment.to);

        if (fromCoords && toCoords) {
            return [fromCoords, toCoords];
        }

        return [];
    }

    extractCoordinates(location) {
        if (!location) return null;

        if (Array.isArray(location) && location.length >= 2) {
            return [location[0], location[1]];
        }

        if (location.pointX !== undefined && location.pointY !== undefined) {
            return [location.pointX, location.pointY];
        }

        if (location.lng !== undefined && location.lat !== undefined) {
            return [location.lng, location.lat];
        }

        if (location.longitude !== undefined && location.latitude !== undefined) {
            return [location.longitude, location.latitude];
        }

        if (location.coordinates && Array.isArray(location.coordinates) && location.coordinates.length >= 2) {
            return [location.coordinates[0], location.coordinates[1]];
        }

        return null;
    }

    validateMapViewPath(path) {
        if (!Array.isArray(path) || path.length === 0) {
            return false;
        }

        return path.every(segment => {
            const hasType = segment.type && (segment.type === 'walking' || segment.type === 'bus');
            const hasCoords = segment.coords && Array.isArray(segment.coords) && segment.coords.length > 0;

            return hasType && hasCoords;
        });
    }

    validateRoute(route) {
        return route instanceof Route && route.isValid();
    }

    getTransformationStats(originalPath, transformedPath) {
        const getLength = (item) => {
            if (item instanceof Route) return item.getComponents().length;
            if (Array.isArray(item)) return item.length;
            return 0;
        };

        const getType = (item) => {
            if (item instanceof Route) return 'Route';
            if (Array.isArray(item)) return 'Array';
            return typeof item;
        };

        return {
            originalType: getType(originalPath),
            originalLength: getLength(originalPath),
            transformedType: getType(transformedPath),
            transformedLength: getLength(transformedPath),
            isValid: this.validateTransformation(originalPath, transformedPath),
            transformationTime: new Date().toISOString()
        };
    }

    validateTransformation(original, transformed) {
        if (transformed instanceof Route) {
            return this.validateRoute(transformed);
        }

        if (Array.isArray(transformed)) {
            return this.validateMapViewPath(transformed);
        }

        return false;
    }

    debugLogTransformation(originalPath, transformedPath) {
        console.group('PathTransformer Debug');
        console.log('Original:', originalPath);
        console.log('Transformed:', transformedPath);
        console.log('Stats:', this.getTransformationStats(originalPath, transformedPath));
        console.groupEnd();
    }
}

const pathTransformerService = new PathTransformerService();
export default pathTransformerService;