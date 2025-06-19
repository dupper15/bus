const BaseHandler = require("./BaseHandler");
const Schedule = require("../../models/ScheduleModel");
const flyweightFactory = require("../flyweight/FlyweightFactory");

class DuplicateScheduleHandler extends BaseHandler {
	async validate(context) {
		const { data, scheduleContext } = context;
		const { line } = scheduleContext.getSharedEntities();

		const checkSchedule = await Schedule.findOne({
			line: line._id,
			time_start: data.time_start,
		});

		if (checkSchedule) {
			const conflictLine = await flyweightFactory.getFlyweight(
				"line",
				checkSchedule.line
			);
			const conflictBus = await flyweightFactory.getFlyweight(
				"bus",
				checkSchedule.bus
			);

			return {
				status: "ERROR",
				message: `Schedule already exists on line ${
					conflictLine.getRepeatingState().name
				} at ${data.time_start} with bus ${
					conflictBus.getRepeatingState().license_plate
				}.`,
			};
		}

		return { status: "OK", message: "No duplicate schedule found" };
	}
}

module.exports = DuplicateScheduleHandler;
