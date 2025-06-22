import geolocationService from './GeolocationService';

const GeoapifyService = {
    fetchSuggestions: async (query, bbox) => {
        return await geolocationService.searchLocations(query, bbox);
    },

    getCurrentLocation: async () => {
        return await geolocationService.getCurrentLocation();
    },

    reverseGeocode: async (coordinates) => {
        return await geolocationService.reverseGeocode(coordinates);
    },

    validateCoordinates: (coordinates) => {
        return geolocationService.validateCoordinates(coordinates);
    },

    formatCoordinates: (coordinates, precision = 6) => {
        return geolocationService.formatCoordinates(coordinates, precision);
    }
};

export default GeoapifyService;