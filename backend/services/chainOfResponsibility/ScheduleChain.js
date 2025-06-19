const DuplicateScheduleHandler = require("./DuplicateScheduleHandler");
const EmployeeConflictHandler = require("./EmployeeConflictHandler");
const BusStatusHandler = require("./BusStatusHandler");
const CreateScheduleHandler = require("./CreateScheduleHandler");

class ScheduleChain {
	static createScheduleChain() {
		const duplicateScheduleHandler = new DuplicateScheduleHandler();
		const employeeConflictHandler = new EmployeeConflictHandler();
		const busStatusHandler = new BusStatusHandler();
		const createScheduleHandler = new CreateScheduleHandler();

		duplicateScheduleHandler
			.setNext(employeeConflictHandler)
			.setNext(busStatusHandler)
			.setNext(createScheduleHandler);

		return duplicateScheduleHandler;
	}
}

module.exports = ScheduleChain;
