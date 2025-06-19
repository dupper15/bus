import StopIterator from './StopIterator';

class LineModel {
    constructor({ id, name, start_place, end_place, time, arr_stop }) {
        this.id = id || null; // Line ID
        this.name = name || "Unnamed Line"; // Line name
        this.start_place = start_place || null; // Start stop (StopModel instance)
        this.end_place = end_place || null; // End stop (StopModel instance)
        this.time = time || 0; // Estimated time in minutes
        this.arr_stop = arr_stop || []; // Array of StopModel instances
    }

    getAllStopsIterator() {
        const allStops = [];
        
        if (this.start_place) {
            allStops.push(this.start_place);
        }
        
        if (this.arr_stop && Array.isArray(this.arr_stop)) {
            allStops.push(...this.arr_stop);
        }
        
        if (this.end_place && 
            (!this.start_place || this.end_place.id !== this.start_place.id)) {
            allStops.push(this.end_place);
        }
        
        return new StopIterator(allStops);
    }

    getIntermediateStopsIterator() {
        return new StopIterator(this.arr_stop || []);
    }

    getOutboundIterator() {
        return this.getAllStopsIterator();
    }

    getInboundIterator() {
        return this.getAllStopsIterator().reverse();
    }

    getStationsIterator() {
        return this.getAllStopsIterator().filter(stop => stop.isStation === true);
    }

    getStopsInAreaIterator(centerX, centerY, radius) {
        return this.getAllStopsIterator().filter(stop => {
            const distance = Math.sqrt(
                Math.pow(stop.pointX - centerX, 2) + 
                Math.pow(stop.pointY - centerY, 2)
            );
            return distance <= radius;
        });
    }

    getStopsBetweenIterator(startStopId, endStopId) {
        const allStops = this.getAllStopsIterator().toArray();
        
        const startIndex = allStops.findIndex(stop => stop.id === startStopId);
        const endIndex = allStops.findIndex(stop => stop.id === endStopId);
        
        if (startIndex === -1 || endIndex === -1) {
            return new StopIterator([]);
        }
        
        const start = Math.min(startIndex, endIndex);
        const end = Math.max(startIndex, endIndex) + 1;
        
        return new StopIterator(allStops.slice(start, end));
    }

    calculateTotalDistance() {
        const iterator = this.getAllStopsIterator();
        let totalDistance = 0;
        let previousStop = null;
        
        iterator.forEach((stop) => {
            if (previousStop) {
                const distance = Math.sqrt(
                    Math.pow(stop.pointX - previousStop.pointX, 2) + 
                    Math.pow(stop.pointY - previousStop.pointY, 2)
                ) * 111;
                totalDistance += distance;
            }
            previousStop = stop;
        });
        
        return totalDistance;
    }

    getStopNames() {
        return this.getAllStopsIterator()
            .map(stop => stop.name)
            .toArray();
    }

    hasStop(stopId) {
        return this.getAllStopsIterator()
            .some(stop => stop.id === stopId);
    }

    getStopCount() {
        return this.getAllStopsIterator().count();
    }
}
export default LineModel;


