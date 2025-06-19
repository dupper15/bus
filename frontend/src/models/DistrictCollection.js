import DistrictIterator from './DistrictIterator';

class DistrictCollection {
    constructor(lines = []) {
        this.districtsMap = new Map();
        this._processLines(lines);
    }

    _processLines(lines) {
        const uniqueStops = new Map();

        lines.forEach(line => {
            const allStopsIterator = line.getAllStopsIterator();
            for (const stop of allStopsIterator) {
                if (stop && stop.id && !uniqueStops.has(stop.id)) {
                    uniqueStops.set(stop.id, stop);
                }
            }
        });

        uniqueStops.forEach(stop => {
            const district = stop.district || 'Unknown District';
            if (!this.districtsMap.has(district)) {
                this.districtsMap.set(district, []);
            }
            this.districtsMap.get(district).push(stop);
        });

        this.districtsMap.forEach(stops => {
            stops.sort((a, b) => a.name.localeCompare(b.name));
        });
    }

    getIterator() {
        const sortedDistrictsMap = new Map([...this.districtsMap.entries()].sort());
        return new DistrictIterator(sortedDistrictsMap);
    }
    getStopsInDistrict(districtName) {
        return this.districtsMap.get(districtName) || [];
    }
    
    getDistrictNames() {
        return Array.from(this.districtsMap.keys()).sort();
    }
}

export default DistrictCollection; 