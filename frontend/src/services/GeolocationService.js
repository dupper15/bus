import mapBoxFacade from "@/services/MapBoxFacade.js";

class GeolocationService {
    constructor() {
        this.mapBoxFacade = mapBoxFacade;
        this.geoapifyApiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;
    }

    async searchLocations(query, bbox = null) {
        if (!query || query.trim().length === 0) {
            return [];
        }

        try {
            const bboxParam = bbox
                ? `&bbox=${bbox.join(',')}`
                : '';

            const response = await fetch(
                `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}${bboxParam}&apiKey=${this.geoapifyApiKey}`
            );

            if (!response.ok) {
                console.log("response", response);
                throw new Error('Failed to fetch location suggestions');
            }

            const data = await response.json();

            return data.features.map(feature => ({
                name: feature.properties.formatted,
                coordinates: [
                    feature.geometry.coordinates[1],
                    feature.geometry.coordinates[0]
                ],
                address: feature.properties.address_line2 || '',
                placeId: feature.properties.place_id
            }));
        } catch (error) {
            console.error('Error searching locations:', error);
            return [];
        }
    }

    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        name: 'Current Location',
                        coordinates: [
                            position.coords.latitude,
                            position.coords.longitude
                        ],
                        accuracy: position.coords.accuracy
                    });
                },
                (error) => {
                    let errorMessage;
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location permission denied';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information unavailable';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out';
                            break;
                        default:
                            errorMessage = 'An unknown error occurred';
                    }
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        });
    }

    async reverseGeocode(coordinates) {
        try {
            const [lat, lng] = coordinates;
            const response = await fetch(
                `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${this.geoapifyApiKey}`
            );

            if (!response.ok) {
                throw new Error('Failed to reverse geocode');
            }

            const data = await response.json();

            if (data.features && data.features.length > 0) {
                const feature = data.features[0];
                return {
                    name: feature.properties.formatted,
                    coordinates: coordinates,
                    address: feature.properties.address_line2 || '',
                    placeId: feature.properties.place_id
                };
            }

            return {
                name: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                coordinates: coordinates,
                address: ''
            };
        } catch (error) {
            console.error('Error reverse geocoding:', error);
            return {
                name: `${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)}`,
                coordinates: coordinates,
                address: ''
            };
        }
    }

    async getWalkingInfo(start, end) {
        const startLngLat = [start[1], start[0]];
        const endLngLat = [end[1], end[0]];

        const directionsData = await this.mapBoxFacade.getDirections(
            [startLngLat, endLngLat],
            'walking'
        );

        if (directionsData.routes && directionsData.routes.length > 0) {
            const route = directionsData.routes[0];
            return {
                distance: route.distance / 1000,
                duration: Math.round(route.duration / 60),
                coordinates: route.geometry.coordinates
            };
        }

        const distance = this.calculateStraightDistance(start, end);
        return {
            distance: distance,
            duration: Math.round(distance * 12),
            coordinates: [startLngLat, endLngLat]
        };
    }

    calculateStraightDistance(coord1, coord2) {
        const [lat1, lng1] = coord1;
        const [lat2, lng2] = coord2;

        const R = 6371;
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    validateCoordinates(coordinates) {
        if (!Array.isArray(coordinates) || coordinates.length !== 2) {
            return false;
        }

        const [lat, lng] = coordinates;
        return (
            typeof lat === 'number' &&
            typeof lng === 'number' &&
            lat >= -90 && lat <= 90 &&
            lng >= -180 && lng <= 180
        );
    }

    formatCoordinates(coordinates, precision = 6) {
        const [lat, lng] = coordinates;
        return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
    }

    getHCMCBoundingBox() {
        return [106.491, 10.348, 107.020, 11.160];
    }

    isWithinBounds(coordinates, bbox) {
        const [lat, lng] = coordinates;
        const [minLng, minLat, maxLng, maxLat] = bbox;

        return (
            lng >= minLng && lng <= maxLng &&
            lat >= minLat && lat <= maxLat
        );
    }

    debounceSearch(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

const geolocationService = new GeolocationService();
export default geolocationService;