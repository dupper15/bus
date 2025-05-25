import Route from '@/components/Route/Route.jsx';
import WalkingSegment from '@/components/Route/WalkingSegment.jsx';
import BusSegment from '@/components/Route/BusSegment.jsx';

/**
 * PathTransformerService - Enhanced to work with Composite pattern
 * Transforms between different route representations and maintains backward compatibility
 */
class PathTransformerService {
    /**
     * Transforms Strategy pattern path to MapView-compatible format
     * Enhanced to handle both legacy arrays and Route composite objects
     * @param {Array|Route} strategyPath - Path from Strategy pattern or Route object
     * @returns {Array} - Path in format expected by MapView
     */
    transformForMapView(strategyPath) {
        // Handle Route composite objects
        if (strategyPath instanceof Route) {
            return this.transformRouteForMapView(strategyPath);
        }

        // Handle legacy array format
        if (Array.isArray(strategyPath) && strategyPath.length > 0) {
            return this.transformLegacyPathForMapView(strategyPath);
        }

        return [];
    }

    /**
     * Transforms Route composite object for MapView
     * @param {Route} route - Route composite object
     * @returns {Array} - MapView-compatible path array
     */
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

            // Add component-specific properties
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

    /**
     * Transforms legacy path array for MapView (backward compatibility)
     * @param {Array} legacyPath - Legacy path array
     * @returns {Array} - MapView-compatible path array
     */
    transformLegacyPathForMapView(legacyPath) {
        return legacyPath.map((segment, index) => {
            const transformedSegment = {
                type: segment.type || 'walking',
                coords: segment.coordinates || segment.coords || [],
                distance: segment.distance || 0,
                duration: segment.duration || 0
            };

            // Add segment-specific properties
            if (segment.type === 'bus') {
                transformedSegment.line = segment.line;
                transformedSegment.from = segment.from;
                transformedSegment.fare = segment.fare || 6000;

                // Handle different 'to' structures
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
                // Walking segment
                transformedSegment.from = segment.from;
                transformedSegment.to = segment.to;
            }

            // Ensure coords array exists and has valid data
            if (!transformedSegment.coords || transformedSegment.coords.length === 0) {
                transformedSegment.coords = this.generateFallbackCoords(segment);
            }

            return transformedSegment;
        }).filter(segment => segment.coords && segment.coords.length > 0);
    }

    /**
     * Transforms legacy path data to Route composite object
     * @param {Array} legacyPath - Legacy path array
     * @param {Object} options - Transformation options
     * @returns {Route} - New Route composite object
     */
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

    /**
     * Transforms Route composite object back to legacy format
     * @param {Route} route - Route composite object
     * @returns {Array} - Legacy path array format
     */
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
                coords: component.getCoordinates() // For backward compatibility
            };

            // Add component-specific properties
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

    /**
     * Creates a Route from MapView path data
     * @param {Array} mapViewPath - Path data from MapView
     * @param {Object} options - Creation options
     * @returns {Route} - New Route composite object
     */
    createRouteFromMapView(mapViewPath, options = {}) {
        if (!Array.isArray(mapViewPath)) {
            return new Route({ name: 'Empty Route' });
        }

        // Convert MapView format back to legacy format, then to Route
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

    /**
     * Optimizes a Route object using various strategies
     * @param {Route} route - Route to optimize
     * @param {string} strategy - Optimization strategy
     * @returns {Route} - Optimized route
     */
    optimizeRoute(route, strategy = 'balanced') {
        if (!(route instanceof Route)) {
            return route;
        }

        const optimizedRoute = route.clone();
        optimizedRoute.strategy = strategy;

        // Apply strategy-specific optimizations
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
            default: // balanced
                this.optimizeBalanced(optimizedRoute);
        }

        return optimizedRoute;
    }

    /**
     * Applies speed-focused optimizations
     * @param {Route} route - Route to optimize
     */
    optimizeForSpeed(route) {
        // Reduce walking segments where possible
        const components = route.getComponents();

        components.forEach(component => {
            if (component instanceof BusSegment) {
                // Prefer express buses
                component.vehicleType = 'express';
            }
        });
    }

    /**
     * Applies distance-focused optimizations
     * @param {Route} route - Route to optimize
     */
    optimizeForDistance(route) {
        // Implementation would optimize for shortest total distance
        // This is a placeholder for more complex optimization logic
    }

    /**
     * Applies transfer-minimization optimizations
     * @param {Route} route - Route to optimize
     */
    optimizeForTransfers(route) {
        // Implementation would minimize bus transfers
        // This is a placeholder for more complex optimization logic
    }

    /**
     * Applies walking-minimization optimizations
     * @param {Route} route - Route to optimize
     */
    optimizeForWalking(route) {
        // Implementation would minimize walking distance
        // This is a placeholder for more complex optimization logic
    }

    /**
     * Applies balanced optimizations
     * @param {Route} route - Route to optimize
     */
    optimizeBalanced(route) {
        // Implementation would balance all factors
        // This is a placeholder for more complex optimization logic
    }

    /**
     * Generates fallback coordinates when segment coordinates are missing
     * @param {Object} segment - Original segment data
     * @returns {Array} - Fallback coordinate array
     */
    generateFallbackCoords(segment) {
        const fromCoords = this.extractCoordinates(segment.from);
        const toCoords = this.extractCoordinates(segment.to);

        if (fromCoords && toCoords) {
            return [fromCoords, toCoords];
        }

        return [];
    }

    /**
     * Extracts coordinates from various location object formats
     * @param {Object|Array} location - Location data
     * @returns {Array|null} - [lng, lat] coordinates
     */
    extractCoordinates(location) {
        if (!location) return null;

        // Array format [lng, lat]
        if (Array.isArray(location) && location.length >= 2) {
            return [location[0], location[1]];
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
        if (location.coordinates && Array.isArray(location.coordinates) && location.coordinates.length >= 2) {
            return [location.coordinates[0], location.coordinates[1]];
        }

        return null;
    }

    /**
     * Validates the transformed path structure
     * @param {Array} path - Transformed path array
     * @returns {boolean} - Whether the path is valid for MapView
     */
    validateMapViewPath(path) {
        if (!Array.isArray(path) || path.length === 0) {
            return false;
        }

        return path.every(segment => {
            // Check required properties
            const hasType = segment.type && (segment.type === 'walking' || segment.type === 'bus');
            const hasCoords = segment.coords && Array.isArray(segment.coords) && segment.coords.length > 0;

            return hasType && hasCoords;
        });
    }

    /**
     * Validates Route composite object
     * @param {Route} route - Route to validate
     * @returns {boolean} - Whether the route is valid
     */
    validateRoute(route) {
        return route instanceof Route && route.isValid();
    }

    /**
     * Gets summary statistics of the transformation
     * @param {Array|Route} originalPath - Original path
     * @param {Array|Route} transformedPath - Transformed path
     * @returns {Object} - Transformation statistics
     */
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

    /**
     * Validates that a transformation was successful
     * @param {Array|Route} original - Original data
     * @param {Array|Route} transformed - Transformed data
     * @returns {boolean} - Whether transformation is valid
     */
    validateTransformation(original, transformed) {
        if (transformed instanceof Route) {
            return this.validateRoute(transformed);
        }

        if (Array.isArray(transformed)) {
            return this.validateMapViewPath(transformed);
        }

        return false;
    }

    /**
     * Logs transformation details for debugging
     * @param {Array|Route} originalPath - Original path
     * @param {Array|Route} transformedPath - Transformed path
     */
    debugLogTransformation(originalPath, transformedPath) {
        console.group('PathTransformer Debug');
        console.log('Original:', originalPath);
        console.log('Transformed:', transformedPath);
        console.log('Stats:', this.getTransformationStats(originalPath, transformedPath));
        console.groupEnd();
    }
}

// Export singleton instance
const pathTransformerService = new PathTransformerService();
export default pathTransformerService;