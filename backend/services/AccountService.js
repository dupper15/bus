const Account = require("../models/AccountModel");
const Customer = require("../models/CustomerModel");
const Employee = require("../models/EmployeeModel");
const Manager = require("../models/ManagerModel");
const bcrypt = require("bcrypt");
const { generalAccessToken, generalRefreshToken } = require("./jwtService");

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

    const type = checkAccount.userType;
    let account = null;
    if (type === "Customer") {
      account = await Customer.findOne({
        id_card: data.id_card,
      });
    } else if (type === "Employee") {
      account = await Employee.findOne({
        id_card: data.id_card,
      });
    } else if (type === "Manager") {
      account = await Manager.findOne({
        id_card: data.id_card,
      });
    }

    const comparePassword = bcrypt.compareSync(
      data.password,
      checkAccount.password
    );
    if (!comparePassword) {
      return {
        status: "ERROR",
        message: "Incorrect password.",
      };
    }

    if (checkAccount.status === "Disable") {
      return {
        status: "ERROR",
        message: "Account can not permisstion to login.",
      };
    }

    if (!account) {
      return {
        status: "ERROR",
        message: "No detailed account found for this user.",
      };
    }

    const access_token = await generalAccessToken({
      id: account.id,
    });
    const refresh_token = await generalRefreshToken({
      id: account.id,
    });

    return {
      status: "OK",
      message: "Login successfully.",
      access_token,
      refresh_token,
      status: checkAccount.status,
      userType: checkAccount.userType,
    };
  } catch (e) {
    return {
      status: "ERROR",
      message: "Failed to login! Please try again.",
      error: e,
    };
  }
};

const getDetailAccount = async (id) => {
  try {
    let account = null;
    const userType = id.charAt(0);
    if (userType === "C") {
      account = await Customer.findOne({ id: id });
    } else if (userType === "E") {
      account = await Employee.findOne({ id: id });
    } else if (userType === "M") {
      account = await Manager.findOne({ id: id });
    }
    return {
      status: "OK",
      message: "Get detail account successfully.",
      data: account,
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

    const isMatch = bcrypt.compareSync(data.password, checkAccount.password);
    if (!isMatch) {
      return {
        status: "ERROR",
        message: "Current password is incorrect",
      };
    }

    const hash = bcrypt.hashSync(data.new_password, 10);

    const updatedAccount = await Account.findOneAndUpdate(
      { user: data.id_card },
      { password: hash },
      { new: true }
    );

    if (!updatedAccount) {
      return {
        status: "ERROR",
        message: "User update failed or not found",
      };
    }

    const type = checkAccount.userType;
    if (type === "Customer") {
      await Customer.findByIdAndUpdate(
        data._id,
        { password: hash },
        { new: true }
      );
    } else if (type === "Employee") {
      await Employee.findByIdAndUpdate(
        data._id,
        { password: hash },
        { new: true }
      );
    } else if (type === "Manager") {
      await Manager.findByIdAndUpdate(
        data._id,
        { password: hash },
        { new: true }
      );
    }
    return {
      status: "OK",
      message: "Password updated successfully",
    };
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
    if (type === "Customer") {
      await Customer.findByIdAndUpdate(data._id, data, { new: true });
    } else if (type === "Employee") {
      await Employee.findByIdAndUpdate(data._id, data, { new: true });
    } else if (type === "Manager") {
      await Manager.findByIdAndUpdate(data._id, data, { new: true });
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

module.exports = {
  loginAccount,
  getDetailAccount,
  changePassword,
  updateAccount,
};
