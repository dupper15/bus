const Bus = require("../../models/BusModel");
const Line = require("../../models/LineModel");
const Employee = require("../../models/EmployeeModel");
const Flyweight = require("./Flyweight");

class FlyweightFactory {
  constructor() {
    this.cache = {
      bus: new Map(),
      line: new Map(),
      employee: new Map(),
    };
  }

  async getFlyweight(type, id) {
    const key = id.toString();
    if (!this.cache[type].has(key)) {
      let data = null;
      switch (type) {
        case "bus":
          data = await Bus.findById(id);
          break;
        case "line":
          data = await Line.findById(id);
          break;
        case "employee":
          data = await Employee.findById(id);
          break;
        default:
          throw new Error(`Unknown flyweight type: ${type}`);
      }
      const flyweight = new Flyweight(type, data);
      this.cache[type].set(key, flyweight);
    }

    return this.cache[type].get(key);
  }
}

module.exports = new FlyweightFactory();
