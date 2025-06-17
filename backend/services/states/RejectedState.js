const IState = require("./IState");
const PendingState = require("./PendingState");

class RejectedState extends IState {
  resubmit(context, data) {
    context.setState(new PendingState());
    context.updateStatus("Pending", data);
  }
}
module.exports = RejectedState;
