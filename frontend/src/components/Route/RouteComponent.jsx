/**
 * RouteComponent - Base interface for the Composite pattern
 * Defines the common interface for both leaf components (segments) and composite (routes)
 */
class RouteComponent {
    constructor() {
        if (this.constructor === RouteComponent) {
            throw new Error("RouteComponent is an abstract class and cannot be instantiated directly");
        }
    }

    /**
     * Gets the distance of this route component in kilometers
     * @returns {number} - Distance in km
     */
    getDistance() {
        throw new Error("getDistance() must be implemented by subclasses");
    }

    /**
     * Gets the duration of this route component in minutes
     * @returns {number} - Duration in minutes
     */
    getDuration() {
        throw new Error("getDuration() must be implemented by subclasses");
    }

    /**
     * Gets the cost of this route component
     * @returns {number} - Cost in the local currency
     */
    getCost() {
        throw new Error("getCost() must be implemented by subclasses");
    }

    /**
     * Gets the starting point of this route component
     * @returns {Object} - Starting location object
     */
    getStartPoint() {
        throw new Error("getStartPoint() must be implemented by subclasses");
    }

    /**
     * Gets the ending point of this route component
     * @returns {Object} - Ending location object
     */
    getEndPoint() {
        throw new Error("getEndPoint() must be implemented by subclasses");
    }

    /**
     * Gets the coordinates for this route component
     * @returns {Array} - Array of [lng, lat] coordinates
     */
    getCoordinates() {
        throw new Error("getCoordinates() must be implemented by subclasses");
    }

    /**
     * Gets the type of this route component
     * @returns {string} - Component type ('walking', 'bus', 'route')
     */
    getType() {
        throw new Error("getType() must be implemented by subclasses");
    }

    /**
     * Renders this route component to JSX
     * @returns {JSX.Element} - JSX representation of the component
     */
    render() {
        throw new Error("render() must be implemented by subclasses");
    }

    /**
     * Validates this route component
     * @returns {boolean} - Whether the component is valid
     */
    isValid() {
        const distance = this.getDistance();
        const duration = this.getDuration();
        const startPoint = this.getStartPoint();
        const endPoint = this.getEndPoint();

        return (
            typeof distance === 'number' && distance >= 0 &&
            typeof duration === 'number' && duration >= 0 &&
            startPoint !== null && endPoint !== null
        );
    }

    /**
     * Gets summary information about this route component
     * @returns {Object} - Summary object with key metrics
     */
    getSummary() {
        return {
            type: this.getType(),
            distance: this.getDistance(),
            duration: this.getDuration(),
            cost: this.getCost(),
            startPoint: this.getStartPoint(),
            endPoint: this.getEndPoint(),
            isValid: this.isValid()
        };
    }

    /**
     * Converts this route component to a plain object for serialization
     * @returns {Object} - Plain object representation
     */
    toJSON() {
        return {
            type: this.getType(),
            distance: this.getDistance(),
            duration: this.getDuration(),
            cost: this.getCost(),
            startPoint: this.getStartPoint(),
            endPoint: this.getEndPoint(),
            coordinates: this.getCoordinates()
        };
    }

    /**
     * Creates a deep copy of this route component
     * @returns {RouteComponent} - Cloned component
     */
    clone() {
        throw new Error("clone() must be implemented by subclasses");
    }

    /**
     * Calculates walking time based on distance
     * @param {number} distance - Distance in km
     * @returns {number} - Walking time in minutes
     */
    static calculateWalkingTime(distance) {
        const walkingSpeedKmh = 5; // 5 km/h average walking speed
        return Math.round((distance / walkingSpeedKmh) * 60);
    }

    /**
     * Calculates bus travel time based on distance
     * @param {number} distance - Distance in km
     * @returns {number} - Bus travel time in minutes
     */
    static calculateBusTime(distance) {
        const busSpeedKmh = 20; // 20 km/h average bus speed in city
        return Math.round((distance / busSpeedKmh) * 60);
    }

    /**
     * Formats coordinates for display
     * @param {Array} coordinates - [lng, lat] coordinates
     * @param {number} precision - Decimal places for formatting
     * @returns {string} - Formatted coordinate string
     */
    static formatCoordinates(coordinates, precision = 4) {
        if (!Array.isArray(coordinates) || coordinates.length < 2) {
            return 'Invalid coordinates';
        }
        return `${coordinates[1].toFixed(precision)}, ${coordinates[0].toFixed(precision)}`;
    }

    /**
     * Validates coordinate format
     * @param {Array} coordinates - Coordinates to validate
     * @returns {boolean} - Whether coordinates are valid
     */
    static validateCoordinates(coordinates) {
        if (!Array.isArray(coordinates) || coordinates.length !== 2) {
            return false;
        }

        const [lng, lat] = coordinates;
        return (
            typeof lng === 'number' && typeof lat === 'number' &&
            lng >= -180 && lng <= 180 &&
            lat >= -90 && lat <= 90
        );
    }

    /**
     * Ensures coordinates are in [lng, lat] format
     * @param {Array} coordinates - Input coordinates
     * @returns {Array} - Coordinates in [lng, lat] format
     */
    static ensureLngLat(coordinates) {
        if (!Array.isArray(coordinates) || coordinates.length !== 2) {
            return null;
        }

        const [first, second] = coordinates;

        // Check if first value looks like latitude (between -90 and 90)
        // and second value looks like longitude (between -180 and 180, typically > 90 for Vietnam)
        if (first >= -90 && first <= 90 && Math.abs(second) > 90) {
            // Input is [lat, lng], swap to [lng, lat]
            return [second, first];
        }

        // Assume input is already [lng, lat]
        return [first, second];
    }

    /**
     * Converts coordinates to [lat, lng] format for display
     * @param {Array} coordinates - [lng, lat] coordinates
     * @returns {Array} - [lat, lng] coordinates
     */
    static toLatlng(coordinates) {
        if (!Array.isArray(coordinates) || coordinates.length !== 2) {
            return null;
        }
        const [lng, lat] = coordinates;
        return [lat, lng];
    }
}

export default RouteComponent;