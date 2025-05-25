/**
 * CoordinateDebugUtil - Utility for debugging coordinate issues
 * Add this to your project temporarily to debug coordinate problems
 */
class CoordinateDebugUtil {
    /**
     * Logs coordinate information for debugging
     * @param {string} label - Debug label
     * @param {Array} coordinates - Coordinates to debug
     */
    static logCoordinates(label, coordinates) {
        if (!Array.isArray(coordinates) || coordinates.length < 2) {
            console.log(`🔍 ${label}:`, 'Invalid coordinates', coordinates);
            return;
        }

        const [first, second] = coordinates;
        const isLngLat = Math.abs(first) > 90; // First value > 90 suggests longitude
        const format = isLngLat ? '[lng, lat]' : '[lat, lng]';

        console.log(`🔍 ${label}:`, {
            coordinates,
            format,
            first: { value: first, type: isLngLat ? 'longitude' : 'latitude' },
            second: { value: second, type: isLngLat ? 'latitude' : 'longitude' },
            valid: this.validateCoordinates(coordinates, isLngLat)
        });
    }

    /**
     * Validates coordinates based on expected format
     * @param {Array} coordinates - Coordinates to validate
     * @param {boolean} isLngLat - Whether format is [lng, lat]
     * @returns {boolean} - Whether coordinates are valid
     */
    static validateCoordinates(coordinates, isLngLat = true) {
        if (!Array.isArray(coordinates) || coordinates.length !== 2) {
            return false;
        }

        const [first, second] = coordinates;

        if (isLngLat) {
            // [lng, lat] format
            return first >= -180 && first <= 180 && second >= -90 && second <= 90;
        } else {
            // [lat, lng] format
            return first >= -90 && first <= 90 && second >= -180 && second <= 180;
        }
    }

    /**
     * Logs MapBox API URL for debugging
     * @param {string} profile - MapBox profile (walking, driving)
     * @param {Array} coordinatesList - Array of coordinate pairs
     */
    static logMapBoxURL(profile, coordinatesList) {
        const waypoints = coordinatesList
            .map(coords => `${coords[0]},${coords[1]}`)
            .join(';');

        const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${waypoints}?geometries=geojson&access_token=YOUR_TOKEN`;

        console.log(`🗺️ MapBox ${profile} URL:`, url);

        // Validate each coordinate
        coordinatesList.forEach((coords, index) => {
            this.logCoordinates(`Waypoint ${index + 1}`, coords);
        });
    }

    /**
     * Converts coordinates to different formats
     * @param {Array} coordinates - Input coordinates
     * @returns {Object} - Coordinates in different formats
     */
    static convertFormats(coordinates) {
        if (!Array.isArray(coordinates) || coordinates.length !== 2) {
            return { error: 'Invalid coordinates' };
        }

        const [first, second] = coordinates;

        return {
            original: coordinates,
            asLngLat: Math.abs(first) > 90 ? [first, second] : [second, first],
            asLatLng: Math.abs(first) > 90 ? [second, first] : [first, second],
            mapBoxFormat: Math.abs(first) > 90 ? `${first},${second}` : `${second},${first}`,
            googleMapsFormat: Math.abs(first) > 90 ? `${second},${first}` : `${first},${second}`
        };
    }

    /**
     * Tests coordinate extraction from different object formats
     * @param {Object} locationObject - Location object to test
     */
    static testExtraction(locationObject) {
        console.log('🧪 Testing coordinate extraction:', locationObject);

        const formats = {
            'Array [lng, lat]': Array.isArray(locationObject) ? locationObject : null,
            'pointX, pointY': locationObject?.pointX !== undefined ? [locationObject.pointX, locationObject.pointY] : null,
            'lng, lat': locationObject?.lng !== undefined ? [locationObject.lng, locationObject.lat] : null,
            'longitude, latitude': locationObject?.longitude !== undefined ? [locationObject.longitude, locationObject.latitude] : null,
            'coordinates array': locationObject?.coordinates ? locationObject.coordinates : null
        };

        Object.entries(formats).forEach(([format, coords]) => {
            if (coords) {
                this.logCoordinates(format, coords);
            }
        });
    }
}


export default CoordinateDebugUtil;