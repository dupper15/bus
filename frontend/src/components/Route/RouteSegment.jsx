import React from 'react';
import RouteComponent from './RouteComponent.jsx';
import WalkingSegment from './WalkingSegment.jsx';
import BusSegment from './BusSegment.jsx';

class RouteSegment extends RouteComponent {
    constructor(options = {}) {
        super();

        this.name = options.name || 'Route';
        this.components = options.components || options.segments || [];
        this.metadata = options.metadata || {};
        this.strategy = options.strategy || 'balanced';
        this.created = options.created || new Date();
        this.optimizationScore = options.optimizationScore || null;

        this.transferPoints = options.transferPoints || [];
        this.alternatives = options.alternatives || [];
        this.confidence = options.confidence || 1.0;
        this.realTimeUpdates = options.realTimeUpdates || false;
    }

    addComponent(component) {
        if (!(component instanceof RouteComponent)) {
            throw new Error('Component must be an instance of RouteComponent');
        }
        this.components.push(component);
    }

    removeComponent(component) {
        const index = this.components.indexOf(component);
        if (index > -1) {
            this.components.splice(index, 1);
        }
    }

    getComponents() {
        return [...this.components];
    }

    getComponentsByType(type) {
        return this.components.filter(component => component.getType() === type);
    }

    getDistance() {
        return this.components.reduce((total, component) => {
            return total + component.getDistance();
        }, 0);
    }

    getDuration() {
        let totalDuration = this.components.reduce((total, component) => {
            return total + component.getDuration();
        }, 0);

        const transferTime = this.getTransferTime();
        totalDuration += transferTime;

        return Math.round(totalDuration);
    }

    getCost() {
        return this.components.reduce((total, component) => {
            return total + component.getCost();
        }, 0);
    }

    getStartPoint() {
        if (this.components.length === 0) return null;
        return this.components[0].getStartPoint();
    }

    getEndPoint() {
        if (this.components.length === 0) return null;
        return this.components[this.components.length - 1].getEndPoint();
    }

    getCoordinates() {
        const allCoords = [];
        this.components.forEach(component => {
            const coords = component.getCoordinates();
            if (Array.isArray(coords)) {
                allCoords.push(...coords);
            }
        });
        return allCoords;
    }

    getType() {
        return 'route';
    }

    getTransferCount() {
        if (this.components.length <= 1) return 0;

        let transfers = 0;
        for (let i = 1; i < this.components.length; i++) {
            const prevType = this.components[i - 1].getType();
            const currType = this.components[i].getType();

            if ((prevType === 'bus' && currType === 'bus') ||
                (prevType === 'bus' && currType === 'walking' &&
                    i < this.components.length - 1 && this.components[i + 1].getType() === 'bus')) {
                transfers++;
            }
        }

        return transfers;
    }

    getTransferTime() {
        const transfers = this.getTransferCount();
        const transferTimePerTransfer = 5;
        return transfers * transferTimePerTransfer;
    }

    getWalkingDistance() {
        return this.getComponentsByType('walking').reduce((total, component) => {
            return total + component.getDistance();
        }, 0);
    }

    getBusDistance() {
        return this.getComponentsByType('bus').reduce((total, component) => {
            return total + component.getDistance();
        }, 0);
    }

    getBusLines() {
        const busSegments = this.getComponentsByType('bus');
        const busLines = new Set();

        busSegments.forEach(segment => {
            const line = segment.getBusLine();
            if (line && line.name) {
                busLines.add(line.name);
            }
        });

        return Array.from(busLines);
    }

    calculateOptimizationScore() {
        if (this.optimizationScore !== null) {
            return this.optimizationScore;
        }

        const distanceWeight = 1.0;
        const durationWeight = 1.5;
        const transferWeight = 10.0;
        const walkingWeight = 2.0;
        const costWeight = 0.1;

        const score =
            (this.getDistance() * distanceWeight) +
            (this.getDuration() * durationWeight) +
            (this.getTransferCount() * transferWeight) +
            (this.getWalkingDistance() * walkingWeight) +
            (this.getCost() * costWeight);

        this.optimizationScore = Math.round(score * 100) / 100;
        return this.optimizationScore;
    }

    render() {
        if (this.components.length === 0) {
            return (
                <div className="p-6 text-center text-gray-500">
                    No route segments available
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{this.name}</h3>
                    <div className="text-sm text-gray-500">
                        {this.strategy} route • Score: {this.calculateOptimizationScore()}
                    </div>
                </div>

                <div className="space-y-6">
                    {this.components.map((component, index) => (
                        <div key={`${component.getType()}-${index}`}>
                            {component.render()}
                        </div>
                    ))}
                </div>

                <div className="pt-4 border-t mt-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                            <div className="text-gray-500">Total distance:</div>
                            <div className="font-medium">{this.getDistance().toFixed(1)}km</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-gray-500">Total time:</div>
                            <div className="font-medium">{this.getDuration()} mins</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-gray-500">Walking:</div>
                            <div className="font-medium">{this.getWalkingDistance().toFixed(1)}km</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-gray-500">Transfers:</div>
                            <div className="font-medium">{this.getTransferCount()}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-gray-500">Total cost:</div>
                            <div className="font-medium">{(this.getCost() / 1000).toFixed(0)}k VND</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-gray-500">Bus lines:</div>
                            <div className="font-medium">{this.getBusLines().join(', ') || 'None'}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderAllStops() {
        const busSegments = this.getComponentsByType('bus');

        if (busSegments.length === 0) {
            return (
                <div className="p-6 text-center text-gray-500">
                    No bus segments in this route
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {busSegments.map((segment, index) => (
                    <div key={index} className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="font-medium">{segment.getBusLine()?.name || 'Bus Route'}</span>
                            <span className="text-sm text-gray-500">
                                ({segment.getAllStops().length} stops)
                            </span>
                        </div>
                        {segment.renderStops()}
                    </div>
                ))}
            </div>
        );
    }

    isValid() {
        if (this.components.length === 0) return false;

        const allComponentsValid = this.components.every(component => component.isValid());

        const isConnected = this.isConnected();

        const hasReasonableConstraints = (
            this.getDistance() <= 100 &&
            this.getDuration() <= 300 &&
            this.getWalkingDistance() <= 20 &&
            this.getTransferCount() <= 5
        );

        return allComponentsValid && isConnected && hasReasonableConstraints;
    }

    isConnected() {
        if (this.components.length <= 1) return true;

        for (let i = 1; i < this.components.length; i++) {
            const prevEnd = this.components[i - 1].getEndPoint();
            const currStart = this.components[i].getStartPoint();

            if (!prevEnd || !currStart) return false;

            const prevCoords = this.extractCoordinates(prevEnd);
            const currCoords = this.extractCoordinates(currStart);

            if (prevCoords && currCoords) {
                const distance = this.calculateDistance(prevCoords, currCoords);
                if (distance > 1.0) return false;
            }
        }

        return true;
    }

    extractCoordinates(location) {
        if (!location) return null;
        if (Array.isArray(location)) return location;
        if (location.pointX !== undefined) return [location.pointX, location.pointY];
        if (location.lng !== undefined) return [location.lng, location.lat];
        if (location.coordinates) return location.coordinates;
        return null;
    }

    calculateDistance(coord1, coord2) {
        const [lng1, lat1] = coord1;
        const [lng2, lat2] = coord2;

        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;

        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    getSummary() {
        const baseSummary = super.getSummary();
        return {
            ...baseSummary,
            name: this.name,
            strategy: this.strategy,
            segments: this.components.length,
            walkingSegments: this.getComponentsByType('walking').length,
            busSegments: this.getComponentsByType('bus').length,
            transfers: this.getTransferCount(),
            walkingDistance: this.getWalkingDistance(),
            busDistance: this.getBusDistance(),
            busLines: this.getBusLines(),
            optimizationScore: this.calculateOptimizationScore(),
            confidence: this.confidence,
            created: this.created,
            metadata: this.metadata
        };
    }

    clone() {
        const clonedComponents = this.components.map(component => component.clone());

        return new RouteSegment({
            name: this.name,
            components: clonedComponents,
            metadata: JSON.parse(JSON.stringify(this.metadata)),
            strategy: this.strategy,
            created: new Date(this.created),
            optimizationScore: this.optimizationScore,
            transferPoints: JSON.parse(JSON.stringify(this.transferPoints)),
            alternatives: this.alternatives.map(alt => alt.clone ? alt.clone() : alt),
            confidence: this.confidence,
            realTimeUpdates: this.realTimeUpdates
        });
    }

    toJSON() {
        const baseJSON = super.toJSON();
        return {
            ...baseJSON,
            name: this.name,
            components: this.components.map(component => component.toJSON()),
            metadata: this.metadata,
            strategy: this.strategy,
            created: this.created.toISOString(),
            optimizationScore: this.optimizationScore,
            transferPoints: this.transferPoints,
            confidence: this.confidence,
            realTimeUpdates: this.realTimeUpdates
        };
    }

    static fromJSON(data) {
        const components = data.components?.map(componentData => {
            switch (componentData.type) {
                case 'walking':
                    return WalkingSegment.fromJSON(componentData);
                case 'bus':
                    return BusSegment.fromJSON(componentData);
                default:
                    throw new Error(`Unknown component type: ${componentData.type}`);
            }
        }) || [];

        return new RouteSegment({
            name: data.name || 'Route',
            components: components,
            metadata: data.metadata || {},
            strategy: data.strategy || 'balanced',
            created: data.created ? new Date(data.created) : new Date(),
            optimizationScore: data.optimizationScore,
            transferPoints: data.transferPoints || [],
            confidence: data.confidence || 1.0,
            realTimeUpdates: data.realTimeUpdates || false
        });
    }

    static fromLegacyData(legacyData) {
        const components = [];

        if (legacyData.segments && Array.isArray(legacyData.segments)) {
            legacyData.segments.forEach(segmentData => {
                switch (segmentData.type) {
                    case 'walking':
                        components.push(WalkingSegment.fromLegacyData(segmentData));
                        break;
                    case 'bus':
                        components.push(BusSegment.fromLegacyData(segmentData));
                        break;
                    default:
                        console.warn(`Unknown segment type: ${segmentData.type}`);
                }
            });
        }

        return new RouteSegment({
            name: legacyData.name || 'Route',
            components: components,
            metadata: legacyData.metadata || {},
            strategy: legacyData.strategy || 'balanced'
        });
    }
}

export default RouteSegment;