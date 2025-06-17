const flyweightFactory = require('./FlyweightFactory');

class ScheduleContext {
  constructor(uniqueState) {
    this.uniqueState = uniqueState;
    this.flyweights = {}; // { bus, line, driver, busboy }
  }

  async loadFlyweights(repeatingIds) {
    this.flyweights.bus = await flyweightFactory.getFlyweight('bus', repeatingIds.busId);
    this.flyweights.line = await flyweightFactory.getFlyweight('line', repeatingIds.lineId);
    this.flyweights.driver = await flyweightFactory.getFlyweight('employee', repeatingIds.driverId);
    this.flyweights.busboy = await flyweightFactory.getFlyweight('employee', repeatingIds.busboyId);
  }

  getDataForSchedule() {
    return {
      ...this.uniqueState,
      bus: this.flyweights.bus.getRepeatingState()._id,
      line: this.flyweights.line.getRepeatingState()._id,
      driver: this.flyweights.driver.getRepeatingState()._id,
      busboy: this.flyweights.busboy.getRepeatingState()._id,
    };
  }

  getSharedEntities() {
    return {
      bus: this.flyweights.bus.getRepeatingState(),
      line: this.flyweights.line.getRepeatingState(),
      driver: this.flyweights.driver.getRepeatingState(),
      busboy: this.flyweights.busboy.getRepeatingState(),
    };
  }
}

module.exports = ScheduleContext;
