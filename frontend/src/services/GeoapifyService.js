import geolocationService from './GeolocationService';

/**
 * GeoapifyService - Refactored to delegate to GeolocationService
 * Maintains backward compatibility while using the facade pattern
 */
const GeoapifyService = {
    /**
     * Fetches location suggestions based on query
     * @param {string} query - Search query
     * @param {Array} bbox - Bounding box for search area
     * @returns {Promise<Array>} - Array of location suggestions
     */
    fetchSuggestions: async (query, bbox) => {
        return await geolocationService.searchLocations(query, bbox);
    },

    /**
     * Gets current user location
     * @returns {Promise<Object>} - Current location object
     */
    getCurrentLocation: async () => {
        return await geolocationService.getCurrentLocation();
    },

    /**
     * Reverse geocodes coordinates to get location details
     * @param {Array} coordinates - [lat, lng] coordinates
     * @returns {Promise<Object>} - Location details
     */
    reverseGeocode: async (coordinates) => {
        return await geolocationService.reverseGeocode(coordinates);
    },

    /**
     * Validates coordinate format
     * @param {Array} coordinates - Coordinates to validate
     * @returns {boolean} - Whether coordinates are valid
     */
    validateCoordinates: (coordinates) => {
        return geolocationService.validateCoordinates(coordinates);
    },

    /**
     * Formats coordinates for display
     * @param {Array} coordinates - Coordinates to format
     * @param {number} precision - Decimal precision
     * @returns {string} - Formatted coordinate string
     */
    formatCoordinates: (coordinates, precision = 6) => {
        return geolocationService.formatCoordinates(coordinates, precision);
    }
};

export default GeoapifyService;