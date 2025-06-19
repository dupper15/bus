const BaseHandler = require("./BaseHandler");
const Schedule = require("../../models/ScheduleModel");

class CreateScheduleHandler extends BaseHandler {
	async validate(context) {
		const { scheduleContext } = context;

		// Sinh ID schedule mới (S001, S002,...)
		const schedules = await Schedule.find({}, { id: 1, _id: 0 }).sort({
			id: 1,
		});
		const existingIds = schedules
			.map((s) => parseInt(s.id.replace("S", ""), 10))
			.sort((a, b) => a - b);
		let newIdNum = 1;
		for (const id of existingIds) {
			if (id === newIdNum) newIdNum++;
			else break;
		}
		const newId = `S${String(newIdNum).padStart(3, "0")}`;
		scheduleContext.uniqueState.id = newId;

		// Tạo lịch trình
		const created = await Schedule.create(scheduleContext.getDataForSchedule());

		return {
			status: "OK",
			message: "Schedule created successfully.",
			data: created,
		};
	}
}

module.exports = CreateScheduleHandler;
