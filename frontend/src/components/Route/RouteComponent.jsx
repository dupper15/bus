class RouteComponent {
    constructor() {
        if (this.constructor === RouteComponent) {
            throw new Error("RouteComponent is an abstract class and cannot be instantiated directly");
        }
    }

    getDistance() {
        throw new Error("getDistance() must be implemented by subclasses");
    }

    getDuration() {
        throw new Error("getDuration() must be implemented by subclasses");
    }

    getCost() {
        throw new Error("getCost() must be implemented by subclasses");
    }

    getStartPoint() {
        throw new Error("getStartPoint() must be implemented by subclasses");
    }

    getEndPoint() {
        throw new Error("getEndPoint() must be implemented by subclasses");
    }

    getCoordinates() {
        throw new Error("getCoordinates() must be implemented by subclasses");
    }

    getType() {
        throw new Error("getType() must be implemented by subclasses");
    }

    render() {
        throw new Error("render() must be implemented by subclasses");
    }

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

    clone() {
        throw new Error("clone() must be implemented by subclasses");
    }

    static calculateWalkingTime(distance) {
        const walkingSpeedKmh = 5;
        return Math.round((distance / walkingSpeedKmh) * 60);
    }

    static calculateBusTime(distance) {
        const busSpeedKmh = 20;
        return Math.round((distance / busSpeedKmh) * 60);
    }

    static formatCoordinates(coordinates, precision = 4) {
        if (!Array.isArray(coordinates) || coordinates.length < 2) {
            return 'Invalid coordinates';
        }
        return `${coordinates[1].toFixed(precision)}, ${coordinates[0].toFixed(precision)}`;
    }

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

    static ensureLngLat(coordinates) {
        if (!Array.isArray(coordinates) || coordinates.length !== 2) {
            return null;
        }

        const [first, second] = coordinates;

        if (first >= -90 && first <= 90 && Math.abs(second) > 90) {
            return [second, first];
        }

        return [first, second];
    }

    static toLatlng(coordinates) {
        if (!Array.isArray(coordinates) || coordinates.length !== 2) {
            return null;
        }
        const [lng, lat] = coordinates;
        return [lat, lng];
    }
}

export default RouteComponent;