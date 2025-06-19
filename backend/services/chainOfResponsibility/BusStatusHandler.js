const BaseHandler = require("./BaseHandler");

class BusStatusHandler extends BaseHandler {
	async validate(context) {
		const { scheduleContext } = context;
		const { bus } = scheduleContext.getSharedEntities();

		if (bus.status !== "Active") {
			return {
				status: "ERROR",
				message: `Bus ${bus.license_plate} is not active.`,
			};
		}

		return { status: "OK", message: "Bus is active" };
	}
}

module.exports = BusStatusHandler;
