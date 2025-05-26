import React from 'react';
import { FaWalking } from 'react-icons/fa';
import RouteComponent from './RouteComponent.jsx';

/**
 * WalkingSegment - Leaf component representing a walking portion of a route
 * Implements the RouteComponent interface for walking transportation
 */
class WalkingSegment extends RouteComponent {
    constructor(options = {}) {
        super();

        this.distance = options.distance || 0;
        this.duration = options.duration || this.calculateDuration();
        this.startPoint = options.startPoint || options.from || null;
        this.endPoint = options.endPoint || options.to || null;
        this.coordinates = options.coordinates || this.generateCoordinates();
        this.path = options.path || []; // Detailed path coordinates for map display

        // Walking-specific properties
        this.terrain = options.terrain || 'flat'; // flat, hilly, stairs
        this.sidewalkAvailable = options.sidewalkAvailable !== false; // Default true
        this.accessibilityFeatures = options.accessibilityFeatures || [];
    }

    /**
     * Gets the distance of this walking segment
     * @returns {number} - Distance in km
     */
    getDistance() {
        return this.distance;
    }

    /**
     * Gets the duration of this walking segment
     * @returns {number} - Duration in minutes
     */
    getDuration() {
        return Math.round(this.duration * 10) / 10;
    }

    /**
     * Gets the cost of walking (always 0)
     * @returns {number} - Cost (0 for walking)
     */
    getCost() {
        return 0; // Walking is free
    }

    /**
     * Gets the starting point of this walking segment
     * @returns {Object} - Starting location object
     */
    getStartPoint() {
        return this.startPoint;
    }

    /**
     * Gets the ending point of this walking segment
     * @returns {Object} - Ending location object
     */
    getEndPoint() {
        return this.endPoint;
    }

    /**
     * Gets the coordinates for this walking segment
     * @returns {Array} - Array of [lng, lat] coordinates
     */
    getCoordinates() {
        return this.path.length > 0 ? this.path : this.coordinates;
    }

    /**
     * Gets the type of this route component
     * @returns {string} - 'walking'
     */
    getType() {
        return 'walking';
    }

    /**
     * Calculates duration based on distance and terrain
     * @returns {number} - Calculated duration in minutes
     */
    calculateDuration() {
        if (this.duration && this.duration > 0) {
            return this.duration;
        }

        let baseTime = RouteComponent.calculateWalkingTime(this.distance);

        // Adjust for terrain
        const terrainMultiplier = {
            'flat': 1.0,
            'hilly': 1.3,
            'stairs': 1.5
        };

        baseTime *= terrainMultiplier[this.terrain] || 1.0;

        // Add buffer time for navigation
        baseTime += 1;

        return Math.round(baseTime);
    }

    /**
     * Generates basic coordinates if not provided
     * @returns {Array} - Array of [lng, lat] coordinates
     */
    generateCoordinates() {
        if (!this.startPoint || !this.endPoint) {
            return [];
        }

        const startCoords = this.extractCoordinates(this.startPoint);
        const endCoords = this.extractCoordinates(this.endPoint);

        if (startCoords && endCoords) {
            return [startCoords, endCoords];
        }

        return [];
    }

    /**
     * Extracts coordinates from various location object formats
     * @param {Object|Array} location - Location data
     * @returns {Array|null} - [lng, lat] coordinates
     */
    extractCoordinates(location) {
        if (!location) return null;

        let coords = null;

        // Array format - could be [lng, lat] or [lat, lng]
        if (Array.isArray(location) && location.length >= 2) {
            coords = [location[0], location[1]];
        }
        // Object with pointX, pointY (bus stop format) - already in [lng, lat]
        else if (location.pointX !== undefined && location.pointY !== undefined) {
            coords = [location.pointX, location.pointY];
        }
        // Object with lng, lat - already in [lng, lat]
        else if (location.lng !== undefined && location.lat !== undefined) {
            coords = [location.lng, location.lat];
        }
        // Object with longitude, latitude - already in [lng, lat]
        else if (location.longitude !== undefined && location.latitude !== undefined) {
            coords = [location.longitude, location.latitude];
        }
        // Object with coordinates array
        else if (location.coordinates && Array.isArray(location.coordinates) && location.coordinates.length >= 2) {
            coords = [location.coordinates[0], location.coordinates[1]];
        }

        // Ensure coordinates are in [lng, lat] format
        return coords ? RouteComponent.ensureLngLat(coords) : null;
    }

    /**
     * Gets the name of a location for display
     * @param {Object} location - Location object
     * @returns {string} - Location name
     */
    getLocationName(location) {
        if (!location) return 'Unknown location';

        if (typeof location === 'string') return location;
        if (location.name) return location.name;
        if (location.formatted) return location.formatted;

        // Format coordinates as fallback
        const coords = this.extractCoordinates(location);
        if (coords) {
            return RouteComponent.formatCoordinates(coords);
        }

        return 'Unknown location';
    }

    /**
     * Renders this walking segment to JSX
     * @returns {JSX.Element} - JSX representation of the walking segment
     */
    render() {
        const fromName = this.getLocationName(this.startPoint);
        const toName = this.getLocationName(this.endPoint);

        return (
            <div className="flex items-start gap-5" key={`walking-${fromName}-${toName}`}>
                <div className="mt-1">
                    <FaWalking className="text-gray-600 text-xl" />
                </div>

                <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                            <p className="text-gray-900 font-medium text-base">
                                Walk to {toName}
                            </p>
                            <p className="text-gray-500 mt-1">
                                From {fromName}
                            </p>
                            {!this.sidewalkAvailable && (
                                <p className="text-orange-600 text-sm mt-1">
                                    ⚠️ Limited sidewalk access
                                </p>
                            )}
                            {this.terrain !== 'flat' && (
                                <p className="text-blue-600 text-sm mt-1">
                                    🏔️ {this.terrain.charAt(0).toUpperCase() + this.terrain.slice(1)} terrain
                                </p>
                            )}
                        </div>
                        <div className="text-right ml-4">
                            <p className="text-green-600 font-medium">{this.getDuration()} mins</p>
                            <p className="text-gray-500 mt-1">
                                {this.getDistance().toFixed(1)}km
                            </p>
                        </div>
                    </div>

                    {this.accessibilityFeatures.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-green-600 text-sm">♿ Accessible:</span>
                            <span className="text-gray-600 text-sm">
                                {this.accessibilityFeatures.join(', ')}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    /**
     * Validates this walking segment
     * @returns {boolean} - Whether the segment is valid
     */
    isValid() {
        const baseValid = super.isValid();
        const hasValidCoordinates = this.getCoordinates().length >= 2;
        const reasonableDistance = this.distance <= 10; // Max 10km walking segment

        return baseValid && hasValidCoordinates && reasonableDistance;
    }

    /**
     * Gets summary information specific to walking
     * @returns {Object} - Walking segment summary
     */
    getSummary() {
        const baseSummary = super.getSummary();
        return {
            ...baseSummary,
            terrain: this.terrain,
            sidewalkAvailable: this.sidewalkAvailable,
            accessibilityFeatures: this.accessibilityFeatures,
            estimatedCalories: Math.round(this.distance * 50), // Rough calorie estimate
            steps: Math.round(this.distance * 1300) // Rough step count estimate
        };
    }

    /**
     * Creates a deep copy of this walking segment
     * @returns {WalkingSegment} - Cloned walking segment
     */
    clone() {
        return new WalkingSegment({
            distance: this.distance,
            duration: this.duration,
            startPoint: JSON.parse(JSON.stringify(this.startPoint)),
            endPoint: JSON.parse(JSON.stringify(this.endPoint)),
            coordinates: [...this.coordinates],
            path: [...this.path],
            terrain: this.terrain,
            sidewalkAvailable: this.sidewalkAvailable,
            accessibilityFeatures: [...this.accessibilityFeatures]
        });
    }

    /**
     * Converts walking segment to plain object
     * @returns {Object} - Plain object representation
     */
    toJSON() {
        const baseJSON = super.toJSON();
        return {
            ...baseJSON,
            terrain: this.terrain,
            sidewalkAvailable: this.sidewalkAvailable,
            accessibilityFeatures: this.accessibilityFeatures,
            path: this.path
        };
    }

    /**
     * Creates a WalkingSegment from a plain object
     * @param {Object} data - Plain object data
     * @returns {WalkingSegment} - New walking segment instance
     */
    static fromJSON(data) {
        return new WalkingSegment({
            distance: data.distance,
            duration: data.duration,
            startPoint: data.startPoint,
            endPoint: data.endPoint,
            coordinates: data.coordinates,
            path: data.path || [],
            terrain: data.terrain || 'flat',
            sidewalkAvailable: data.sidewalkAvailable !== false,
            accessibilityFeatures: data.accessibilityFeatures || []
        });
    }

    /**
     * Creates a WalkingSegment from legacy route segment data
     * @param {Object} legacyData - Legacy segment data
     * @returns {WalkingSegment} - New walking segment instance
     */
    static fromLegacyData(legacyData) {
        return new WalkingSegment({
            distance: legacyData.distance || 0,
            duration: legacyData.duration || 0,
            startPoint: legacyData.from || legacyData.startPoint,
            endPoint: legacyData.to || legacyData.endPoint,
            coordinates: legacyData.coords || legacyData.coordinates || [],
            path: legacyData.path || []
        });
    }
}

export default WalkingSegment;