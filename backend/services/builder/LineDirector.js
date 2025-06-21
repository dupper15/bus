class LineDirector {
  /**
   *
   * @param {ILineBuilder} builder
   */
  constructor(builder) {
    this.builder = builder;
  }

  /**
   * @param {ILineBuilder} builder
   */
  changeBuilder(builder) {
    this.builder = builder;
  }

  /**
   * @param {Object} data
   * @returns {Object} Line
   */
  makeDraftLine(data) {
    this.builder.reset();
    this.builder.setName(data.name);
    this.builder.setStartPlace(data.start_place);
    this.builder.setEndPlace(data.end_place);
    this.builder.setArrStop(data.arr_stop);
    this.builder.setTime(data.time);
    this.builder.setStatus(data.status || "draft");
    return this.builder.getResult();
  }

  /**
   * @param {Object} data
   * @returns {Object} Line
   */
  makePublishedLine(data) {
    this.builder.reset();
    this.builder.setName(data.name);
    this.builder.setStartPlace(data.start_place);
    this.builder.setEndPlace(data.end_place);
    this.builder.setArrStop(data.arr_stop);
    this.builder.setTime(data.time);
    this.builder.setStatus(data.status || "published");
    return this.builder.getResult();
  }
}

module.exports = LineDirector;
