import routingService from './RoutingService';

/**
 * MapBoxService - Refactored to delegate to RoutingService
 * Maintains backward compatibility while using the facade pattern
 */
const MapBoxService = {
    /**
     * Fetches bus line route through multiple stops
     * @param {Array} stops - Array of bus stops
     * @returns {Promise<Object>} - Route object with coordinates
     */
    fetchBusLineRoute: async (stops) => {
        const route = await routingService.getBusRoute(stops);
        return route || { coordinates: [] };
    },

    /**
     * Gets walking route between two points
     * @param {Array} start - Starting coordinates [lat, lng]
     * @param {Array} end - Ending coordinates [lat, lng]
     * @returns {Promise<Object>} - Walking route data
     */
    fetchWalkingRoute: async (start, end) => {
        // Convert from [lat, lng] to [lng, lat] for MapBox
        const startLngLat = [start[1], start[0]];
        const endLngLat = [end[1], end[0]];

        const route = await routingService.getWalkingRoute(startLngLat, endLngLat);
        return route || { coordinates: [], distance: 0, duration: 0 };
    },

    /**
     * Finds optimal route between locations
     * @param {Array} startCoords - Starting coordinates
     * @param {Array} endCoords - Ending coordinates
     * @param {Array} busStops - Available bus stops
     * @param {Array} busLines - Available bus lines
     * @returns {Promise<Object>} - Optimal route
     */
    findOptimalRoute: async (startCoords, endCoords, busStops, busLines) => {
        return await routingService.findBestRoute(startCoords, endCoords, busStops, busLines);
    },

    /**
     * Calculates distance between two points
     * @param {Array} coord1 - First coordinate [lng, lat]
     * @param {Array} coord2 - Second coordinate [lng, lat]
     * @returns {number} - Distance in kilometers
     */
    calculateDistance: (coord1, coord2) => {
        return routingService.calculateDistance(coord1, coord2);
    },

    /**
     * Finds nearest stops to a location
     * @param {Array} coordinates - Location coordinates [lng, lat]
     * @param {Array} busStops - Array of bus stops
     * @param {number} maxDistance - Maximum search distance in km
     * @returns {Array} - Array of nearby stops with distances
     */
    findNearbyStops: (coordinates, busStops, maxDistance = 1) => {
        return routingService.findNearestStops(coordinates, busStops, maxDistance);
    }
};

export default MapBoxService;