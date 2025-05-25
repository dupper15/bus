/**
 * PathTransformerService - Transforms Strategy pattern route data
 * into the format expected by the existing MapView component
 */
class PathTransformerService {
    /**
     * Transforms Strategy pattern path to MapView-compatible format
     * @param {Array} strategyPath - Path from Strategy pattern with segments
     * @returns {Array} - Path in format expected by MapView
     */
    transformForMapView(strategyPath) {
        if (!Array.isArray(strategyPath) || strategyPath.length === 0) {
            return [];
        }

        return strategyPath.map((segment, index) => {
            // Transform to the format expected by MapView
            const transformedSegment = {
                type: segment.type || 'walking',
                coords: segment.coordinates || [], // MapView expects 'coords', not 'coordinates'
                distance: segment.distance || 0,
                duration: segment.duration || 0
            };

            // Add bus-specific properties
            if (segment.type === 'bus') {
                transformedSegment.line = segment.line;
                transformedSegment.from = segment.from;

                // Handle different 'to' structures
                if (segment.intermediateStops && Array.isArray(segment.intermediateStops)) {
                    transformedSegment.to = segment.intermediateStops;
                } else if (segment.stops && Array.isArray(segment.stops)) {
                    transformedSegment.to = segment.stops;
                } else if (segment.to) {
                    // Single destination - convert to array format
                    transformedSegment.to = [segment.to];
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
     * Logs path structure for debugging
     * @param {Array} originalPath - Original Strategy pattern path
     * @param {Array} transformedPath - Transformed MapView path
     */
    debugLogPath(originalPath, transformedPath) {
        console.group('PathTransformer Debug');
        console.log('Original Strategy Path:', originalPath);
        console.log('Transformed MapView Path:', transformedPath);
        console.log('Transformation Valid:', this.validateMapViewPath(transformedPath));
        console.groupEnd();
    }

    /**
     * Gets summary statistics of the transformation
     * @param {Array} originalPath - Original path
     * @param {Array} transformedPath - Transformed path
     * @returns {Object} - Transformation statistics
     */
    getTransformationStats(originalPath, transformedPath) {
        return {
            originalSegments: Array.isArray(originalPath) ? originalPath.length : 0,
            transformedSegments: Array.isArray(transformedPath) ? transformedPath.length : 0,
            walkingSegments: transformedPath.filter(s => s.type === 'walking').length,
            busSegments: transformedPath.filter(s => s.type === 'bus').length,
            totalCoordinates: transformedPath.reduce((sum, s) => sum + (s.coords?.length || 0), 0),
            isValid: this.validateMapViewPath(transformedPath)
        };
    }
}

// Export singleton instance
const pathTransformerService = new PathTransformerService();
export default pathTransformerService;