const IState = require("./IState");
const ApprovedState = require("./ApprovedState");
const RejectedState = require("./RejectedState");

class PendingState extends IState {
  approve(context, data) {
    context.setState(new ApprovedState());
    context.updateStatus("Approved", data);
  }

  reject(context, data) {
    context.setState(new RejectedState());
    context.updateStatus("Rejected", data);
  }
}
module.exports = PendingState;
