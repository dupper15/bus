const IState = require("./IState");

class ApprovedState extends IState {
  approve() {
    throw new Error("Đơn đã được duyệt.");
  }

  reject() {
    throw new Error("Không thể từ chối đơn đã duyệt.");
  }
}
module.exports = ApprovedState;
