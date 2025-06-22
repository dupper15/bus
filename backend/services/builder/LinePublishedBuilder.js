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
      status: "published", // Nếu schema không có `status`, bạn nên xóa dòng này
    });
  }

  setName(name) {
    if (!name) throw new Error("Line name is required.");
    this.line.name = name;
  }

  setStartPlace(pointId) {
    if (!pointId) {
      throw new Error("Start place ID is required.");
    }
    this.line.start_place = pointId;
  }

  setEndPlace(pointId) {
    if (!pointId) {
      throw new Error("End place ID is required.");
    }
    this.line.end_place = pointId;
  }

  setArrStop(stopIds) {
    if (!Array.isArray(stopIds)) throw new Error("Stops must be an array.");
    this.line.arr_stop = stopIds;
  }

  setTime(time) {
    if (typeof time !== "number" || time <= 0) {
      throw new Error("Time must be a positive number.");
    }
    this.line.time = time;
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
