const Account = require("../../models/AccountModel");
const AccountFactory = require("./AccountFactory");

const loginAccount = async (data) => {
  try {
    const checkAccount = await Account.findOne({
      user: data.id_card,
    });
    if (!checkAccount) {
      return {
        status: "ERROR",
        message: "No account found.",
      };
    }
    console.log("Account found:", checkAccount);
    const type = checkAccount.userType;
    console.log("Account type:", type);
    const accountService = AccountFactory.createAccountService(type);
    console.log("Account service created:", accountService);
    const response = await accountService.login(data);
    console.log("Login response:", response);
    if (response.status === "ERROR") {
      return {
        status: "ERROR",
        message: response.message,
      };
    }

    return {
      status: "OK",
      message: "Login successfully.",
      access_token: response.access_token,
      refresh_token: response.refresh_token,
      userType: checkAccount.userType,
    };
  } catch (error) {
    return {
      status: "ERROR",
      message: "An error occurred while logging in.",
      error: error.message,
    };
  }
};

const getDetailAccount = async (data) => {
  try {
    const checkAccount = await Account.findOne({
      user: data.id_card,
    });

    if (!checkAccount) {
      return {
        status: "ERROR",
        message: `Account with id ${data.id_card} not found.`,
      };
    }
    const type = checkAccount.userType;
    const accountService = await AccountFactory.createAccountService(type);
    const response = await accountService.getDetailAccount(data._id);

    if (response.status === "ERROR") {
      return {
        status: "ERROR",
        message: response.message,
      };
    }

    return {
      status: "OK",
      message: "Get detail account successfully.",
      data: response.data,
    };
  } catch (e) {
    return {
      status: "ERROR",
      message: `Account with id ${id} not found.`,
      error: e,
    };
  }
};

const changePassword = async (data) => {
  try {
    const checkAccount = await Account.findOne({
      user: data.id_card,
    });

    if (!checkAccount) {
      return {
        status: "ERROR",
        message: `Account with id ${data.id_card} not found.`,
      };
    }
    const type = checkAccount.userType;
    const accountService = AccountFactory.createAccountService(type);
    const response = await accountService.changePassword(data);

    return response;
  } catch (e) {
    return {
      status: "ERROR",
      message: "An error occurred during the password change process.",
      error: e.message,
    };
  }
};

const updateAccount = async (data) => {
  try {
    const checkAccount = await Account.findOne({
      user: data.id_card,
    });

    if (!checkAccount) {
      return {
        status: "ERROR",
        message: `Account with id ${data.id_card} not found.`,
      };
    }

    const type = checkAccount.userType;
    const accountService = AccountFactory.createAccountService(type);
    const response = await accountService.updateAccount(data._id, data);
    if (response.status === "ERROR") {
      return {
        status: "ERROR",
        message: response.message,
      };
    }
    return {
      status: "OK",
      message: "Updated profile successfully",
    };
  } catch (e) {
    return {
      status: "ERROR",
      message: "An error occurred during the password change process.",
      error: e.message,
    };
  }
};

const changeStatus = async (id) => {
  try {
    const checkAccount = await Account.findOne({
      user: id,
    });

    if (!checkAccount) {
      return {
        status: "ERROR",
        message: `Account with id ${data.id_card} not found.`,
      };
    }

    const type = checkAccount.userType;
    const accountService = AccountFactory.createAccountService(type);
    const response = await accountService.changeStatus(data._id);
    if (response.status === "ERROR") {
      return {
        status: "ERROR",
        message: response.message,
      };
    }
    return {
      status: "OK",
      message: "Changed status account successfully",
    };
  } catch (e) {
    return {
      status: "ERROR",
      message: "An error occurred during changing status of account.",
      error: e.message,
    };
  }
};

const deleteAccount = async (id) => {
  try {
    const checkAccount = await Account.findOne({
      user: id,
    });

    if (!checkAccount) {
      return {
        status: "ERROR",
        message: `Account with id ${data.id_card} not found.`,
      };
    }

    const type = checkAccount.userType;
    const accountService = AccountFactory.createAccountService(type);
    const response = await accountService.deleteAccount(data._id);
    if (response.status === "ERROR") {
      return {
        status: "ERROR",
        message: response.message,
      };
    }
    return {
      status: "OK",
      message: "Deleted account successfully",
    };
  } catch (e) {
    return {
      status: "ERROR",
      message: "An error occurred during deleting account.",
      error: e.message,
    };
  }
};

const getAllAccounts = async (data) => {
  try {
    const type = data;
    const accountService = await AccountFactory.createAccountService(type);
    const response = await accountService.getAllAccounts();

    if (response.status === "ERROR") {
      return {
        status: "ERROR",
        message: response.message,
      };
    }

    return {
      status: "OK",
      message: "Get all accounts successfully.",
      data: response.data,
    };
  } catch (e) {
    return {
      status: "ERROR",
      message: `Accounts not found.`,
      error: e,
    };
  }
};

const createAccount = async (data) => {
  try {
    // Kiểm tra tài khoản đã tồn tại chưa
    const existingAccount = await Account.findOne({
      user: data.id_card,
    });

    if (existingAccount) {
      return {
        status: "ERROR",
        message: `Account with id ${data.id_card} already exists.`,
      };
    }

    // Xác định loại tài khoản và gọi service tương ứng
    const type = data.userType;
    const accountService = AccountFactory.createAccountService(type);

    const response = await accountService.createAccount(data);

    if (response.status === "ERROR") {
      return {
        status: "ERROR",
        message: response.message,
      };
    }

    return {
      status: "OK",
      message: "Created account successfully",
    };
  } catch (e) {
    return {
      status: "ERROR",
      message: "An error occurred during the account creation process.",
      error: e.message,
    };
  }
};

module.exports = {
  loginAccount,
  getDetailAccount,
  changePassword,
  updateAccount,
  getAllAccounts,
  changeStatus,
  deleteAccount,
  createAccount
};
