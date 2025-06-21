import React from 'react';
import { FaWalking } from 'react-icons/fa';
import RouteComponent from './RouteComponent.jsx';

class WalkingSegment extends RouteComponent {
    constructor(options = {}) {
        super();

        this.distance = options.distance || 0;
        this.duration = options.duration || this.calculateDuration();
        this.startPoint = options.startPoint || options.from || null;
        this.endPoint = options.endPoint || options.to || null;
        this.coordinates = options.coordinates || this.generateCoordinates();
        this.path = options.path || [];

        this.terrain = options.terrain || 'flat';
        this.sidewalkAvailable = options.sidewalkAvailable !== false;
        this.accessibilityFeatures = options.accessibilityFeatures || [];
    }

    getDistance() {
        return this.distance;
    }

    getDuration() {
        return Math.round(this.duration * 10) / 10;
    }

    getCost() {
        return 0;
    }

    getStartPoint() {
        return this.startPoint;
    }

    getEndPoint() {
        return this.endPoint;
    }

    getCoordinates() {
        return this.path.length > 0 ? this.path : this.coordinates;
    }

    getType() {
        return 'walking';
    }

    calculateDuration() {
        if (this.duration && this.duration > 0) {
            return this.duration;
        }

        let baseTime = RouteComponent.calculateWalkingTime(this.distance);

        const terrainMultiplier = {
            'flat': 1.0,
            'hilly': 1.3,
            'stairs': 1.5
        };

        baseTime *= terrainMultiplier[this.terrain] || 1.0;

        baseTime += 1;

        return Math.round(baseTime);
    }

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

    extractCoordinates(location) {
        if (!location) return null;

        let coords = null;

        if (Array.isArray(location) && location.length >= 2) {
            coords = [location[0], location[1]];
        }
        else if (location.pointX !== undefined && location.pointY !== undefined) {
            coords = [location.pointX, location.pointY];
        }
        else if (location.lng !== undefined && location.lat !== undefined) {
            coords = [location.lng, location.lat];
        }
        else if (location.longitude !== undefined && location.latitude !== undefined) {
            coords = [location.longitude, location.latitude];
        }
        else if (location.coordinates && Array.isArray(location.coordinates) && location.coordinates.length >= 2) {
            coords = [location.coordinates[0], location.coordinates[1]];
        }

        return coords ? RouteComponent.ensureLngLat(coords) : null;
    }

    getLocationName(location) {
        if (!location) return 'Unknown location';

        if (typeof location === 'string') return location;
        if (location.name) return location.name;
        if (location.formatted) return location.formatted;

        const coords = this.extractCoordinates(location);
        if (coords) {
            return RouteComponent.formatCoordinates(coords);
        }

        return 'Unknown location';
    }

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

    isValid() {
        const baseValid = super.isValid();
        const hasValidCoordinates = this.getCoordinates().length >= 2;
        const reasonableDistance = this.distance <= 10;

        return baseValid && hasValidCoordinates && reasonableDistance;
    }

    getSummary() {
        const baseSummary = super.getSummary();
        return {
            ...baseSummary,
            terrain: this.terrain,
            sidewalkAvailable: this.sidewalkAvailable,
            accessibilityFeatures: this.accessibilityFeatures,
            estimatedCalories: Math.round(this.distance * 50),
            steps: Math.round(this.distance * 1300)
        };
    }

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