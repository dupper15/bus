class StopModel {
    constructor({ id, name, address, district, pointX, pointY, isStation }) {
        this.id = id || null; // Stop ID
        this.name = name || "Unnamed Stop"; // Stop name
        this.address = address || "Unknown Address"; // Stop address
        this.district = district || "Unknown District"; // Stop district
        this.pointX = pointX || 0; // Longitude
        this.pointY = pointY || 0; // Latitude
        this.isStation = isStation || false; // Indicates if it's a station
    }
}
export default StopModel;
