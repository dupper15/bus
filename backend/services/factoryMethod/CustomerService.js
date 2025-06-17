const Customer = require("../../models/CustomerModel");
const bcrypt = require("bcrypt");
const { generalAccessToken, generalRefreshToken } = require("../JwtService");
const Account = require("../../models/AccountModel");
const IAccount = require("./AccountInterface");

class CustomerService extends IAccount {
  /**
   * Creates a new customer account.
   * @param {Object} data - The data for the new customer.
   * @returns {Promise<Object>} The result of the creation attempt.
   */
  async createAccount(data) {
    try {
      const existingCustomer = await Account.findOne({ user: data.id_card });
      if (existingCustomer) {
        return {
          status: "ERROR",
          message: "A account with this ID card already exists.",
        };
      }

      const hashedPassword = bcrypt.hashSync(data.password, 10);

      // Get all existing IDs and sort them
      const customers = await Customer.find({}, { id: 1, _id: 0 }).sort({
        id: 1,
      });

      const ids = customers.map((emp) => parseInt(emp.id.replace("C", ""), 10));

      // Find the smallest missing ID
      let newIdNumber = 1;
      for (const id of ids) {
        if (id === newIdNumber) {
          newIdNumber++;
        } else {
          break;
        }
      }
      const newId = `C${String(newIdNumber).padStart(3, "0")}`;

      const createdCustomer = await Customer.create({
        id: newId,
        name: data.name,
        gender: data.gender,
        image: data.image,
        phone: data.phone,
        id_card: data.id_card,
        username: data.username,
        password: hashedPassword,
      });

      await Account.create({
        user: createdCustomer.id_card,
        userType: "Customer",
        username: data.username,
        password: hashedPassword,
      });

      return {
        status: "OK",
        message: "Customer created successfully.",
        data: createdCustomer,
      };
    } catch (error) {
      return {
        status: "ERROR",
        message: "An error occurred while creating the customer.",
        error: error.message,
      };
    }
  }

  /**
   * Logs in a customer account.
   * @param {Object} loginData - The login data for the customer.
   * @returns {Promise<Object>} The result of the login attempt.
   */
  async login(loginData) {
    try {
      const { id_card, password } = loginData;
      const checkCustomer = await Customer.findOne({
        id_card: id_card,
      });
      if (checkCustomer === null) {
        return {
          status: "ERROR",
          message: "No customer found with the provided ID card.",
        };
      }

      const comparePassword = bcrypt.compareSync(
        password,
        checkCustomer.password
      );

      if (!comparePassword) {
        return {
          status: "ERROR",
          message: "Incorrect ID card or password.",
        };
      }

      const access_token = await generalAccessToken({
        id: checkCustomer.id,
        id_card: checkCustomer.id_card,
        _id: checkCustomer._id,
      });
      const refresh_token = await generalRefreshToken({
        id: checkCustomer.id,
        id_card: checkCustomer.id_card,
        _id: checkCustomer._id,
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
        message: "An error occurred while logging in the customer.",
        error: e,
      };
    }
  }
  /**
   * Updates customer information.
   * @param {Object} customerId - The ID of the customer to update.
   * @param {Object} data - The new data for the customer.
   * @returns {Promise<Object>} The result of the update attempt.
   */
  async updateAccount(customerId, data) {
    try {
      const checkCustomer = await Customer.findOne({ _id: customerId });
      if (checkCustomer === null) {
        return {
          status: "ERROR",
          message: "No customer found with the provided ID.",
        };
      }

      const updatedCustomer = await Customer.findByIdAndUpdate(
        customerId,
        data,
        { new: true }
      );

      if (!updatedCustomer) {
        return {
          status: "ERROR",
          message: "Failed to update the customer or customer not found.",
        };
      }

      return {
        status: "OK",
        message: "Customer updated successfully.",
        data: updatedCustomer,
      };
    } catch (e) {
      return {
        status: "ERROR",
        message: "An error occurred while updating the customer.",
        error: e,
      };
    }
  }
  /**
   * Changes the status of a customer account.
   * @param {Object} customerId - The ID of the customer whose status is to be changed.
   * @returns {Promise<Object>} The result of the status change attempt.
   */
  async changeStatus(customerId) {
    try {
      const checkCustomer = await Customer.findOne({ _id: customerId });
      if (!checkCustomer) {
        return {
          status: "ERROR",
          message: "No customer found with the provided ID.",
        };
      }

      const status = checkCustomer.status === "Disable" ? "Enable" : "Disable";

      const updatedCustomer = await Customer.findByIdAndUpdate(
        customerId,
        { status: status },
        { new: true }
      );

      if (!updatedCustomer) {
        return {
          status: "ERROR",
          message: "Failed to update the customer or customer not found.",
        };
      }

      await Account.findOneAndUpdate(
        { user: checkCustomer.id_card },
        { status: status },
        { new: true }
      );

      return {
        status: "OK",
        message: "Customer updated successfully.",
        data: updatedCustomer,
      };
    } catch (e) {
      return {
        status: "ERROR",
        message: "An error occurred while updating the customer.",
        error: e,
      };
    }
  }
  /**
   * Deletes a customer account.
   * @param {Object} customerId - The ID of the customer to delete.
   * @returns {Promise<Object>} The result of the deletion attempt.
   */
  async deleteAccount(customerId) {
    try {
      const checkCustomer = await Customer.findOne({ _id: customerId });
      if (!checkCustomer) {
        return {
          status: "ERROR",
          message: "No customer found with the provided ID.",
        };
      }

      await Customer.findByIdAndDelete(customerId);
      await Account.findOneAndDelete({ user: checkCustomer.id_card });

      return {
        status: "OK",
        message: "Customer deleted successfully.",
      };
    } catch (e) {
      return {
        status: "ERROR",
        message: "An error occurred while deleting the customer.",
        error: e,
      };
    }
  }
  /**
   * Retrieves all customer accounts.
   * @returns {Promise<Object>} The list of all customer accounts.
   */
  async getAllAccounts() {
    try {
      const allCustomer = await Customer.find();
      return {
        status: "OK",
        message: "Customers retrieved successfully.",
        data: allCustomer,
      };
    } catch (e) {
      return {
        status: "ERROR",
        message: "An error occurred while retrieving the customers.",
        error: e,
      };
    }
  }
  /**
   * Retrieves detailed information about a specific customer.
   * @param {Object} customerId - The ID of the customer to retrieve.
   * @returns {Promise<Object>} The detailed information of the customer.
   */
  async getDetailAccount(customerId) {
    try {
      const customer = await Customer.findOne({
        _id: customerId,
      });
      if (customer === null) {
        return {
          status: "ERROR",
          message: "No customer found with the provided ID.",
        };
      }
      return {
        status: "OK",
        message: "Customer details retrieved successfully.",
        data: customer,
      };
    } catch (e) {
      return {
        status: "ERROR",
        message: "An error occurred while retrieving the customer details.",
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

      await Customer.findOneAndUpdate(
        { id_card: data.id_card },
        { password: hash },
        { new: true }
      );
      return {
        status: "OK",
        message: "Password updated successfully",
      };
    } catch (e) {
      console.error("Error changing password:", e);
      return {
        status: "ERROR",
        message: "An error occurred during the password change process.",
        error: e.message,
      };
    }
  }
}

module.exports = CustomerService;
