class AccountServiceProxy {
  constructor(realService) {
    this.realService = realService;
  }

  async login(data) {
    console.log(`[LOGIN] Bắt đầu đăng nhập cho user: ${data.id_card}`);
    if (!data.password || !data.id_card) {
      return {
        status: "ERROR",
        message: "Missing id_card or password.",
      };
    }
    const result = await this.realService.login(data);

    if (result.status === "OK") {
      console.log(`[LOGIN SUCCESS] id_card: ${data.id_card}`);
    } else {
      console.warn(
        `[LOGIN FAIL] id_card: ${data.id_card} – Reason: ${result.message}`
      );
    }

    return result;
  }

  async getDetailAccount(id) {
    console.log(`[GET DETAIL] id: ${id}`);
    return await this.realService.getDetailAccount(id);
  }

  async changePassword(data) {
    if (data.pasword === data.new_password) {
      return {
        status: "ERROR",
        message: "New password must be different from old password.",
      };
    }
    return await this.realService.changePassword(data);
  }

  async updateAccount(id, data) {
    console.log(`[UPDATE] user ${data.id_card}`);
    return await this.realService.updateAccount(id, data);
  }

  async changeStatus(id) {
    console.log(`[CHANGE STATUS] user ${id}`);
    return await this.realService.changeStatus(id);
  }

  async deleteAccount(id) {
    console.log(`[DELETE] user ${id}`);
    return await this.realService.deleteAccount(id);
  }

  async getAllAccounts(data) {
    console.log(`[GET ALL ACCOUNTS] type: ${data}`);
    return await this.realService.getAllAccounts(data);
  }
}

module.exports = AccountServiceProxy;
