const PendingState = require("./PendingState");
const ApprovedState = require("./ApprovedState");
const RejectedState = require("./RejectedState");
const DayOff = require("../../models/DayOffModel");

class DayOffContext {
  constructor(currentStatus) {
    this.state = this.mapState(currentStatus);
  }

  mapState(status) {
    switch (status) {
      case "pending":
        return new PendingState();
      case "approved":
        return new ApprovedState();
      case "rejected":
        return new RejectedState();
      default:
        throw new Error("Trạng thái không hợp lệ.");
    }
  }

  setState(state) {
    this.state = state;
  }

  async updateStatus(status, data) {
    await DayOff.findOneAndUpdate(
      { id: data.id },
      {
        status,
        manager: data.manager,
        feedback: data.feedback,
        date_resolved: new Date(),
      }
    );
  }

  async approve(data) {
    await this.state.approve(this, data);
  }

  async reject(data) {
    await this.state.reject(this, data);
  }

  async resubmit(data) {
    if (this.state.resubmit) {
      await this.state.resubmit(this, data);
    } else {
      throw new Error("Không thể gửi lại đơn ở trạng thái hiện tại.");
    }
  }
}

module.exports = DayOffContext;
