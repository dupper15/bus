class IState {
  approve(context, data) {
    throw new Error("Not implemented");
  }
  reject(context, data) {
    throw new Error("Not implemented");
  }
  resubmit(context, data) {
    throw new Error("Not implemented");
  }
}
module.exports = IState;
