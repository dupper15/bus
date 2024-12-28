const Employee = require("../models/EmployeeModel");
const Bus = require("../models/BusModel");
const DayOff = require("../models/DayOffModel");
const Opinion = require("../models/OpinionModel");

const getSumary = async () => {
  try {
    const [employees, buses, dayOffs, opinions] = await Promise.all([
      Employee.find(),
      Bus.find(),
      DayOff.find({ status: "Pending" }),
      Opinion.find(),
    ]);
    const totalEmployees = employees.length;
    const totalBus = buses.length;
    const totalDayOffs = dayOffs.length;
    const totalOpinions = opinions.length;
    return {
      status: "OK",
      message: "Summary data retrieved successfully.",
      data: { totalEmployees, totalBus, totalDayOffs, totalOpinions },
    };
  } catch (e) {
    return {
      status: "ERROR",
      message: "An error occurred while retrieving the summary data.",
      error: e.message,
    };
  }
};

module.exports = {
  getSumary,
};
