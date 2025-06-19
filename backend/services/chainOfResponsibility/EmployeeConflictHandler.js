const BaseHandler = require("./BaseHandler");
const Schedule = require("../../models/ScheduleModel");
const flyweightFactory = require("../flyweight/FlyweightFactory");

class EmployeeConflictHandler extends BaseHandler {
	async validate(context) {
		const { data, scheduleContext } = context;
		const { line, driver, busboy } = scheduleContext.getSharedEntities();

		const parseTime = (timeStr) => {
			const [hours, minutes] = timeStr.split(":").map(Number);
			return hours * 60 + minutes;
		};

		const newStart = parseTime(data.time_start);
		const newEnd = newStart + line.time;

		const checkConflicts = async (type, personId, name) => {
			const schedules = await Schedule.find({ [type]: personId });

			for (const schedule of schedules) {
				const line = await flyweightFactory.getFlyweight("line", schedule.line);

				const existStart = parseTime(schedule.time_start);
				const existEnd = existStart + line.getRepeatingState().time;
				const isOverlap = !(newStart > existEnd || newEnd < existStart);

				if (isOverlap) {
					return {
						status: "ERROR",
						message: `${name} is already assigned to another schedule from ${
							schedule.time_start
						} to ${String(Math.floor(existEnd / 60)).padStart(2, "0")}:${String(
							existEnd % 60
						).padStart(2, "0")} on line ${line.getRepeatingState().name}.`,
					};
				}
			}
			return null;
		};

		const conflictBusboy = await checkConflicts(
			"busboy",
			busboy._id,
			`Busboy ${busboy.name}`
		);
		if (conflictBusboy) return conflictBusboy;

		const conflictDriver = await checkConflicts(
			"driver",
			driver._id,
			`Driver ${driver.name}`
		);
		if (conflictDriver) return conflictDriver;

		return { status: "OK", message: "No employee conflict found" };
	}
}

module.exports = EmployeeConflictHandler;
