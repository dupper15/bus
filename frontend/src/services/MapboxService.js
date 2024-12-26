import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = "pk.eyJ1IjoibGR2MTIiLCJhIjoiY200eTRtdmRtMHJiOTJrcTc1dW15cG5teiJ9.MMYAJ5OuU2cXhgydFpRXHg";

const MapBoxService = {
    fetchBusLineRoute: async (stops) => {
        if (stops.length < 2) {
            throw new Error("At least two stops are required to create a bus line.");
        }

        const waypoints = stops.map((stop) => `${stop.pointX},${stop.pointY}`).join(";");
        const apiUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${waypoints}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.routes || !data.routes[0]) {
            throw new Error("Failed to fetch bus line route.");
        }

        return data.routes[0].geometry;
    },

    fetchSuggestions: async (query, bbox) => {
        if (!query) return [];

        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?bbox=${bbox.join(',')}&access_token=${mapboxgl.accessToken}`;
        const response = await fetch(url);
        const data = await response.json();

        return data.features.map(feature => ({
            id: feature.id,
            name: feature.place_name,
            coordinates: feature.geometry.coordinates,
        }));
    },

    fetchPath: async (startStop, endStop) => {
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${startStop.pointX},${startStop.pointY};${endStop.pointX},${endStop.pointY}?geometries=geojson&access_token=${mapboxgl.accessToken}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
            return data.routes[0].geometry.coordinates;
        } else {
            throw new Error("No route found.");
        }
    }
};

export default MapBoxService;