const GeoapifyApiKey = "e3576034d5864c2f82e871596c0652f7";

const GeoapifyService = {
    fetchSuggestions: async (query) => {
        if (!query) return [];

        const bbox = [106.491, 10.348, 107.020, 11.160]; // Ho Chi Minh City bounding box
        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&filter=rect:${bbox.join(",")}&apiKey=${GeoapifyApiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        return data.features.map(feature => ({
            id: feature.properties.osm_id,
            name: feature.properties.formatted,
            coordinates: [
                feature.geometry.coordinates[0],
                feature.geometry.coordinates[1],
            ],
        }));
    },
};

export default GeoapifyService;