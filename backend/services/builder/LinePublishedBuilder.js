const ILineBuilder = require("./LineBuilderInterface");
const Line = require("../../models/LineModel");

class LinePublishedBuilder extends ILineBuilder {
  constructor() {
    this.reset();
  }

  reset() {
    console.log("Resetting LinePublishedBuilder to initial state");
    this.line = new Line({
      name: "",
      start: null,
      end: null,
      stops: [],
      time: 0,
      status: "published",
    });
  }

  setName(name) {
    if (!name) throw new Error("Line name is required.");
    this.line.name = name;
  }

  setStartPlace(point) {
    if (!point || point.x == null || point.y == null) {
      throw new Error("Start point is required.");
    }
    this.line.start = point;
  }

  setEndPlace(point) {
    if (!point || point.x == null || point.y == null) {
      throw new Error("End point is required.");
    }
    this.line.end = point;
  }

  setArrStop(stops) {
    if (!Array.isArray(stops)) throw new Error("Stops must be an array.");
    this.line.stops = stops;
  }

  setTime(time) {
    if (typeof time !== "number" || time <= 0) {
      throw new Error("Time must be a positive number.");
    }
    this.line.time = time;
  }

  getResult() {
    const { name, start, end, time } = this.line;
    if (!name || !start || !end || time <= 0) {
      throw new Error(
        "Published line must have name, start, end, and valid time."
      );
    }
    return this.line;
  }
}

module.exports = LinePublishedBuilder;
