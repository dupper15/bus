const ILineBuilder = require("./LineBuilderInterface");
const Line = require("../../models/LineModel");

/**
 * Builder for Draft Line (partial data allowed)
 */
class LineDraftBuilder extends ILineBuilder {
  constructor() {
    this.reset();
  }

  reset() {
    console.log("Resetting LineDraftBuilder to initial state");
    this.line = new Line({
      name: "",
      start: null,
      end: null,
      stops: [],
      time: 0,
      status: "draft",
    });
  }

  setName(name) {
    this.line.name = name || "";
  }

  setStartPlace(point) {
    this.line.start = point || null;
  }

  setEndPlace(point) {
    this.line.end = point || null;
  }

  setArrStop(stops) {
    this.line.stops = Array.isArray(stops) ? stops : [];
  }

  setTime(time) {
    this.line.time = typeof time === "number" ? time : 0;
  }

  getResult() {
    return this.line;
  }
}

module.exports = LineDraftBuilder;
