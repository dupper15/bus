class StopIterator {
    constructor(stops = []) {
        this.stops = stops;
    }

    toArray() {
        return [...this.stops];
    }

    reverse() {
        return new StopIterator([...this.stops].reverse());
    }

    map(transform) {
        const mapped = this.stops.map(transform);
        return new StopIterator(mapped);
    }

    forEach(callback) {
        this.stops.forEach(callback);
    }

    [Symbol.iterator]() {
        let index = 0;
        const stops = this.stops;
        
        return {
            next() {
                if (index < stops.length) {
                    return { value: stops[index++], done: false };
                } else {
                    return { done: true };
                }
            }
        };
    }
}

export default StopIterator; 