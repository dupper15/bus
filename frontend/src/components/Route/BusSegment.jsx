import React from 'react';
import { FaBus, FaCircle } from 'react-icons/fa';
import RouteComponent from './RouteComponent.jsx';

class BusSegment extends RouteComponent {
    constructor(options = {}) {
        super();

        this.distance = options.distance || 0;
        this.duration = options.duration || this.calculateDuration();
        this.startPoint = options.startPoint || options.from || null;
        this.endPoint = options.endPoint || options.to || null;
        this.coordinates = options.coordinates || this.generateCoordinates();

        this.busLine = options.busLine || options.line || null;
        this.fare = options.fare || 6000;
        this.intermediateStops = options.intermediateStops || options.stops || [];
        this.schedule = options.schedule || null;
        this.vehicleType = options.vehicleType || 'standard';
        this.accessibility = options.accessibility || [];

        this.allStops = this.buildStopSequence();
    }

    getDistance() {
        return this.distance;
    }

    getDuration() {
        return Math.round(this.duration * 10) / 10;
    }

    getCost() {
        return this.fare;
    }

    getStartPoint() {
        return this.startPoint;
    }

    getEndPoint() {
        return this.endPoint;
    }

    getCoordinates() {
        return this.coordinates;
    }

    getType() {
        return 'bus';
    }

    getBusLine() {
        return this.busLine;
    }

    getAllStops() {
        return this.allStops;
    }

    getIntermediateStopCount() {
        return Math.max(0, this.allStops.length - 2);
    }

    buildStopSequence() {
        const stops = [];

        if (this.startPoint) {
            stops.push(this.startPoint);
        }

        if (this.intermediateStops && this.intermediateStops.length > 0) {
            this.intermediateStops.forEach(stop => {
                if (!this.stopEquals(stop, this.startPoint) && !this.stopEquals(stop, this.endPoint)) {
                    stops.push(stop);
                }
            });
        }

        if (this.endPoint && !this.stopEquals(this.endPoint, this.startPoint)) {
            stops.push(this.endPoint);
        }

        return stops;
    }

    stopEquals(stop1, stop2) {
        if (!stop1 || !stop2) return false;

        if (stop1.id && stop2.id) {
            return stop1.id === stop2.id;
        }

        if (stop1.name && stop2.name) {
            return stop1.name === stop2.name;
        }

        const coords1 = this.extractCoordinates(stop1);
        const coords2 = this.extractCoordinates(stop2);

        if (coords1 && coords2) {
            const threshold = 0.0001;
            return Math.abs(coords1[0] - coords2[0]) < threshold &&
                Math.abs(coords1[1] - coords2[1]) < threshold;
        }

        return false;
    }

    calculateDuration() {
        if (this.duration && this.duration > 0) {
            return this.duration;
        }

        let baseTime = RouteComponent.calculateBusTime(this.distance);

        const stopTime = this.getIntermediateStopCount();
        baseTime += stopTime;

        const vehicleMultiplier = {
            'express': 0.8,
            'standard': 1.0,
            'articulated': 1.1
        };

        baseTime *= vehicleMultiplier[this.vehicleType] || 1.0;

        return Math.round(baseTime);
    }

    generateCoordinates() {
        const coords = [];

        this.allStops.forEach(stop => {
            const stopCoords = this.extractCoordinates(stop);
            if (stopCoords) {
                coords.push(stopCoords);
            }
        });

        return coords;
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
        if (!location) return 'Unknown stop';

        if (typeof location === 'string') return location;
        if (location.name) return location.name;
        if (location.formatted) return location.formatted;

        const coords = this.extractCoordinates(location);
        if (coords) {
            return RouteComponent.formatCoordinates(coords);
        }

        return 'Unknown stop';
    }

    getNextBusTime() {
        return Math.floor(Math.random() * 15) + 1;
    }

    render() {
        const fromName = this.getLocationName(this.startPoint);
        const toName = this.getLocationName(this.endPoint);
        const nextBus = this.getNextBusTime();
        const stopCount = this.getIntermediateStopCount();

        return (
            <div className="flex items-start gap-5" key={`bus-${this.busLine?.name || 'unknown'}-${fromName}`}>
                <div className="mt-1">
                    <FaBus className="text-gray-600 text-xl" />
                </div>

                <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                            <p className="text-gray-900 font-medium text-base">
                                Take {this.busLine?.name || 'Bus'} towards {toName}
                            </p>
                            <p className="text-gray-500 mt-1">
                                From {fromName}
                            </p>
                        </div>
                        <div className="text-right ml-4">
                            <p className="text-green-600 font-medium">{this.getDuration()} mins</p>
                            <p className="text-gray-500 mt-1">
                                {this.getDistance().toFixed(1)}km
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                        <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                            {(this.fare / 1000).toFixed(0)}k VND
                        </span>
                        <span className="text-gray-500">
                            • Next bus in {nextBus} mins
                        </span>
                        {stopCount > 0 && (
                            <span className="text-gray-500">
                                • {stopCount} stops
                            </span>
                        )}
                    </div>

                    {this.accessibility.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-green-600 text-sm">♿ Accessible:</span>
                            <span className="text-gray-600 text-sm">
                                {this.accessibility.join(', ')}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    renderStops() {
        return (
            <div className="space-y-3 pl-8">
                {this.allStops.map((stop, stopIndex) => (
                    <div key={stopIndex} className="flex items-center gap-3">
                        <div className="relative flex items-center">
                            <FaCircle className={`w-2 h-2 ${
                                stopIndex === 0 || stopIndex === this.allStops.length - 1
                                    ? 'text-green-500'
                                    : 'text-gray-400'
                            }`} />
                            {stopIndex !== this.allStops.length - 1 && (
                                <div className="absolute top-3 left-1 w-px h-6 bg-gray-300" />
                            )}
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">{this.getLocationName(stop)}</p>
                            {stop.address && (
                                <p className="text-sm text-gray-500">{stop.address}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    isValid() {
        const baseValid = super.isValid();
        const hasValidBusLine = this.busLine && this.busLine.name;
        const hasValidStops = this.allStops.length >= 2;
        const reasonableFare = this.fare >= 0 && this.fare <= 50000;

        return baseValid && hasValidBusLine && hasValidStops && reasonableFare;
    }

    getSummary() {
        const baseSummary = super.getSummary();
        return {
            ...baseSummary,
            busLine: this.busLine,
            fare: this.fare,
            totalStops: this.allStops.length,
            intermediateStops: this.getIntermediateStopCount(),
            vehicleType: this.vehicleType,
            accessibility: this.accessibility,
            nextBusTime: this.getNextBusTime()
        };
    }

    clone() {
        return new BusSegment({
            distance: this.distance,
            duration: this.duration,
            startPoint: JSON.parse(JSON.stringify(this.startPoint)),
            endPoint: JSON.parse(JSON.stringify(this.endPoint)),
            coordinates: [...this.coordinates],
            busLine: this.busLine ? JSON.parse(JSON.stringify(this.busLine)) : null,
            fare: this.fare,
            intermediateStops: JSON.parse(JSON.stringify(this.intermediateStops)),
            schedule: this.schedule ? JSON.parse(JSON.stringify(this.schedule)) : null,
            vehicleType: this.vehicleType,
            accessibility: [...this.accessibility]
        });
    }

    toJSON() {
        const baseJSON = super.toJSON();
        return {
            ...baseJSON,
            busLine: this.busLine,
            fare: this.fare,
            intermediateStops: this.intermediateStops,
            allStops: this.allStops,
            schedule: this.schedule,
            vehicleType: this.vehicleType,
            accessibility: this.accessibility
        };
    }

    static fromJSON(data) {
        return new BusSegment({
            distance: data.distance,
            duration: data.duration,
            startPoint: data.startPoint,
            endPoint: data.endPoint,
            coordinates: data.coordinates,
            busLine: data.busLine,
            fare: data.fare || 6000,
            intermediateStops: data.intermediateStops || [],
            schedule: data.schedule,
            vehicleType: data.vehicleType || 'standard',
            accessibility: data.accessibility || []
        });
    }

    static fromLegacyData(legacyData) {
        return new BusSegment({
            distance: legacyData.distance || 0,
            duration: legacyData.duration || 0,
            startPoint: legacyData.from || legacyData.startPoint,
            endPoint: legacyData.to || legacyData.endPoint,
            coordinates: legacyData.coords || legacyData.coordinates || [],
            busLine: legacyData.line || legacyData.busLine,
            fare: legacyData.fare || 6000,
            intermediateStops: legacyData.intermediateStops || legacyData.stops || []
        });
    }
}

export default BusSegment;