import StopIterator from './StopIterator';

class DistrictIterator {
    constructor(districtsMap) {
        this.districts = Array.from(districtsMap.entries());
        this.currentIndex = 0;
    }

    hasNext() {
        return this.currentIndex < this.districts.length;
    }

    next() {
        if (!this.hasNext()) {
            return null;
        }

        const [districtName, stops] = this.districts[this.currentIndex];
        this.currentIndex++;
        
        return {
            district: districtName,
            stops: stops,
            stopsIterator: new StopIterator(stops)
        };
    }

    [Symbol.iterator]() {
        let index = 0;
        const districts = this.districts;
        
        return {
            next: () => {
                if (index < districts.length) {
                    const [districtName, stops] = districts[index++];
                    const value = {
                        district: districtName,
                        stops: stops,
                        stopsIterator: new StopIterator(stops)
                    };
                    return { value, done: false };
                } else {
                    return { done: true };
                }
            }
        };
    }

    toArray() {
        return this.districts.map(([district, stops]) => ({ district, stops }));
    }
}

export default DistrictIterator; 