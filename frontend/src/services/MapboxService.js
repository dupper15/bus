import mapboxgl from "mapbox-gl";

export const fetchBusLineRoute = async (stops) => {
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
};