const Manager = require("../../models/ManagerModel");
const bcrypt = require("bcrypt");
const { generalAccessToken, generalRefreshToken } = require("../JwtService");
const Account = require("../../models/AccountModel");
const IAccount = require("./AccountInterface");

class ManagerService extends IAccount {
  /**
   * Creates a new manager account.
   * @param {Object} data - The data for the new manager.
   * @returns {Promise<Object>} The result of the creation attempt.
   */
  async createAccount(data) {
    try {
      const checkManager = await Account.findOne({ user: data.id_card });
      if (checkManager) {
        return {
          status: "ERROR",
          message: "A manager with this ID card already exists.",
        };
      }

      const hash = bcrypt.hashSync(data.password, 10);

      // Get all existing IDs and sort them
      const managers = await Manager.find({}, { id: 1, _id: 0 }).sort({
        id: 1,
      });

      const ids = managers.map((mgr) => parseInt(mgr.id.replace("M", ""), 10));

      // Find the smallest missing ID
      let newIdNumber = 1;
      for (const id of ids) {
        if (id === newIdNumber) {
          newIdNumber++;
        } else {
          break;
        }
      }
      const newId = `M${String(newIdNumber).padStart(3, "0")}`;

      const createdManager = await Manager.create({
        id: newId,
        name: data.name,
        gender: data.gender,
        image: data.image,
        id_card: data.id_card,
        username: data.username,
        password: hash,
        phone: data.phone,
      });

      await Account.create({
        user: data.id_card,
        userType: "Manager",
        username: data.username,
        password: hash,
      });

      return {
        status: "OK",
        message: "Manager created successfully.",
        data: createdManager,
      };
    } catch (e) {
      return {
        status: "ERROR",
        message: "An error occurred while creating the manager.",
        error: e,
      };
    }
  }
  /**
   * Logs in a manager account.
   * @param {Object} data - The login credentials.
   * @returns {Promise<Object>} The result of the login attempt.
   */
  async login(data) {
    try {
      const { id_card, password } = data;
      const checkManager = await Manager.findOne({ id_card });
      if (checkManager === null) {
        return {
          status: "ERROR",
          message: "No manager found with the provided ID card.",
        };
      }

      const comparePassword = bcrypt.compareSync(
        password,
        checkManager.password
      );
      if (!comparePassword) {
        return {
          status: "ERROR",
          message: "Password is incorrect.",
        };
      }

      const access_token = await generalAccessToken({
        id: checkManager.id,
        id_card: checkManager.id_card,
        _id: checkManager._id,
      });
      const refresh_token = await generalRefreshToken({
        id: checkManager.id,
        id_card: checkManager.id_card,
        _id: checkManager._id,
      });

      return {
        status: "OK",
        message: "Login successful.",
        access_token,
        refresh_token,
      };
    } catch (e) {
      return {
        status: "ERROR",
        message: "An error occurred while logging in the manager.",
        error: e,
      };
    }
  }
  /**
   * Updates manager account information.
   * @param {Object} accountId - The ID of the account to update.
   * @param {Object} data - The new data for the account.
   * @returns {Promise<Object>} The result of the update attempt.
   */
  async updateAccount(accountId, data) {
    try {
      const checkManager = await Manager.findOne({ _id: accountId });
      if (!checkManager) {
        return {
          status: "ERROR",
          message: "No manager found with the provided ID.",
        };
      }

      const updatedManager = await Manager.findByIdAndUpdate(
        checkManager._id,
        data,
        { new: true }
      );

      if (!updatedManager) {
        return {
          status: "ERROR",
          message: "Failed to update the manager or manager not found.",
        };
      }

      return {
        status: "OK",
        message: "Manager updated successfully.",
        data: updatedManager,
      };
    } catch (e) {
      return {
        status: "ERROR",
        message: "An error occurred while updating the manager.",
        error: e,
      };
    }
  }
  /**
   * Changes the status of a manager account.
   * @param {Object} managerId - The ID of the manager whose status is to be changed.
   * @returns {Promise<Object>} The result of the status change attempt.
   */
  async changeStatus(managerId) {
    try {
      const checkManager = await Manager.findById(managerId);
      if (!checkManager) {
        return {
          status: "ERROR",
          message: "No manager found with the provided ID.",
        };
      }

      const status = checkManager.status === "Disable" ? "Enable" : "Disable";

      const updatedManager = await Manager.findByIdAndUpdate(
        managerId,
        { status: status },
        { new: true }
      );

      const account = await Account.findOne({ user: checkManager.id_card });

      account.status = status;
      account.save();

      if (!updatedManager) {
        return {
          status: "ERROR",
          message: "Failed to update the manager or manager not found.",
        };
      }

      return {
        status: "OK",
        message: "Manager changed status successfully.",
        data: updatedManager,
      };
    } catch (e) {
      return {
        status: "ERROR",
        message: "An error occurred while updating the manager.",
        error: e,
      };
    }
  }
  /**
   * Deletes a manager account.
   * @param {Object} accountId - The ID of the account to delete.
   * @returns {Promise<Object>} The result of the deletion attempt.
   */
  async deleteAccount(accountId) {
    try {
      const checkManager = await Manager.findById(accountId);
      if (!checkManager) {
        return {
          status: "ERROR",
          message: "No manager found with the provided ID.",
        };
      }

      await Manager.findByIdAndDelete(accountId);
      await Account.findOneAndDelete({ user: checkManager.id_card });

      return {
        status: "OK",
        message: "Deleted manager successfully.",
      };
    } catch (e) {
      return {
        status: "ERROR",
        message: "An error occurred while updating the manager.",
        error: e,
      };
    }
  }
  /**
   * Retrieves all manager accounts.
   * @returns {Promise<Object>} The list of all managers.
   */
  async getAllAccounts() {
    try {
      const allManager = await Manager.find();
      return {
        status: "OK",
        message: "Managers retrieved successfully.",
        data: allManager,
      };
    } catch (e) {
      return {
        status: "ERROR",
        message: "An error occurred while retrieving the managers.",
        error: e,
      };
    }
  }
  /**
   * Retrieves details of a specific manager.
   * @param {Object} managerId - The ID of the manager to retrieve.
   * @returns {Promise<Object>} The details of the specified manager.
   */
  async getDetailAccount(managerId) {
    try {
      const manager = await Manager.findOne({ _id: managerId });
      if (manager === null) {
        return {
          status: "ERROR",
          message: "No manager found with the provided ID.",
        };
      }
      return {
        status: "OK",
        message: "Manager details retrieved successfully.",
        data: manager,
      };
    } catch (e) {
      return {
        status: "ERROR",
        message: "An error occurred while retrieving the manager details.",
        error: e,
      };
    }
  }
  /**
   * Changes the password of a customer account.
   * @param {Object} data - The data containing the new password.
   * @returns {Promise<Object>} The result of the password change attempt.
   */
  async changePassword(data) {
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

      await Manager.findOneAndUpdate(
        { id_card: data.id_card },
        { password: hash },
        { new: true }
      );
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
  }
}

module.exports = ManagerService;
