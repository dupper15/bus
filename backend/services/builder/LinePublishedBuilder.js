const ILineBuilder = require("./LineBuilderInterface");
const Line = require("../../models/LineModel");

class LinePublishedBuilder extends ILineBuilder {
  constructor() {
    super();
    this.reset();
  }

  reset() {
    console.log("Resetting LinePublishedBuilder to initial state");
    this.line = new Line({
      name: "",
      start_place: null,
      end_place: null,
      arr_stop: [],
      time: 0,
      status: "published",
    });
  }

  setName(name) {
    if (!name) throw new Error("Line name is required.");
    this.line.name = name;
  }

  setStartPlace(place) {
    if (!place || !place._id) throw new Error("Invalid start place.");

    if ("isStation" in place && !place.isStation) {
      throw new Error(
        "Start place must be a station if 'isStation' is specified."
      );
    }

    this.line.start_place = place._id;
    this._start_place_data = place;
  }

  setEndPlace(place) {
    if (!place || !place._id) throw new Error("Invalid end place.");

    if ("isStation" in place && !place.isStation) {
      throw new Error(
        "End place must be a station if 'isStation' is specified."
      );
    }

    this.line.end_place = place._id;
    this._end_place_data = place;
  }

  setArrStop(stops) {
    if (!Array.isArray(stops)) throw new Error("Stops must be an array.");

    if (stops.length < 3) {
      throw new Error("Stops must have at least 3 elements.");
    }

    const uniqueStops = [];
    const seen = new Set();

    for (const stop of stops) {
      if (!stop || !stop._id) continue;
      if (!seen.has(stop._id)) {
        seen.add(stop._id);
        uniqueStops.push(stop);
      }
    }

    if (uniqueStops.length < 3) {
      throw new Error("Stops must have at least 3 unique elements.");
    }

    const first = uniqueStops[0];
    const last = uniqueStops[uniqueStops.length - 1];

    if (!this._start_place_data || first._id !== this._start_place_data._id) {
      throw new Error("First stop must match start_place.");
    }

    if (!this._end_place_data || last._id !== this._end_place_data._id) {
      throw new Error("Last stop must match end_place.");
    }

    this.line.arr_stop = uniqueStops.map((s) => s._id);
    this._arr_stop_data = uniqueStops;
  }

  setTime(time) {
    if (typeof time === "number" && time > 0) {
      this.line.time = time;
      return;
    }

    if (!this._arr_stop_data || this._arr_stop_data.length < 2) {
      throw new Error("Cannot auto-calculate time: missing stop data.");
    }

    const DEGREE_TO_KM = 111.32;
    const AVERAGE_SPEED_KMPH = 40;
    const STOP_DURATION_MINUTES = 1;

    let totalKm = 0;

    for (let i = 1; i < this._arr_stop_data.length; i++) {
      const prev = this._arr_stop_data[i - 1];
      const curr = this._arr_stop_data[i];

      const dx = curr.pointX - prev.pointX;
      const dy = curr.pointY - prev.pointY;
      const distanceInDegrees = Math.sqrt(dx * dx + dy * dy);
      const distanceInKm = distanceInDegrees * DEGREE_TO_KM;

      totalKm += distanceInKm;
    }

    const travelTimeHours = totalKm / AVERAGE_SPEED_KMPH;
    const travelTimeMinutes = travelTimeHours * 60;

    const stopTimeMinutes = this._arr_stop_data.length * STOP_DURATION_MINUTES;

    this.line.time = Math.ceil(travelTimeMinutes + stopTimeMinutes);
  }

  setStatus(status) {
    this.line.status = "published";
  }

  getResult() {
    const { name, start_place, end_place, time } = this.line;
    if (!name || !start_place || !end_place || time <= 0) {
      throw new Error(
        "Published line must have name, start_place, end_place, and valid time."
      );
    }
    return this.line;
  }
}

module.exports = LinePublishedBuilder;
