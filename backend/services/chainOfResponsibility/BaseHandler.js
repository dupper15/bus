class BaseHandler {
	constructor() {
		this.nextHandler = null;
	}

	setNext(handler) {
		this.nextHandler = handler;
		return handler;
	}

	async handle(context) {
		const result = await this.validate(context);

		if (result.status === "ERROR") {
			return result;
		}

		if (this.nextHandler) {
			return await this.nextHandler.handle(context);
		}

		return result;
	}

	// Abstract method
	async validate(context) {
		throw new Error("Validate method must be implemented");
	}
}

module.exports = BaseHandler;
