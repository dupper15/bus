import routingService from './RoutingService';

const MapBoxService = {
    fetchBusLineRoute: async (stops) => {
        const route = await routingService.getBusRoute(stops);
        return route || { coordinates: [] };
    },

    fetchWalkingRoute: async (start, end) => {
        const startLngLat = [start[1], start[0]];
        const endLngLat = [end[1], end[0]];

        const route = await routingService.getWalkingRoute(startLngLat, endLngLat);
        return route || { coordinates: [], distance: 0, duration: 0 };
    },

    findOptimalRoute: async (startCoords, endCoords, busStops, busLines) => {
        return await routingService.findBestRoute(startCoords, endCoords, busStops, busLines);
    },

    calculateDistance: (coord1, coord2) => {
        return routingService.calculateDistance(coord1, coord2);
    },

    findNearbyStops: (coordinates, busStops, maxDistance = 1) => {
        return routingService.findNearestStops(coordinates, busStops, maxDistance);
    }
};

export default MapBoxService;