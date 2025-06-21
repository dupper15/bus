const ILineBuilder = require("./LineBuilderInterface");
const Line = require("../../models/LineModel");

class LineDraftBuilder extends ILineBuilder {
  constructor() {
    super();
    this.reset();
  }

  reset() {
    console.log("Resetting LineDraftBuilder to initial state");
    this.line = new Line({
      name: "",
      start_place: null,
      end_place: null,
      arr_stop: [],
      time: 0,
      // status: "draft", // ❌ Bỏ nếu schema không có
    });
  }

  setName(name) {
    this.line.name = name || "";
  }

  setStartPlace(pointId) {
    this.line.start_place = pointId || null;
  }

  setEndPlace(pointId) {
    this.line.end_place = pointId || null;
  }

  setArrStop(stopIds) {
    this.line.arr_stop = Array.isArray(stopIds) ? stopIds : [];
  }

  setTime(time) {
    this.line.time = typeof time === "number" ? time : 0;
  }

  setStatus(status) {
    this.line.status = status || "draft";
  }

  getResult() {
    return this.line;
  }
}

module.exports = LineDraftBuilder;
