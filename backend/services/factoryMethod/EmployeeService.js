const Employee = require("../../models/EmployeeModel");
const bcrypt = require("bcrypt");
const { generalAccessToken, generalRefreshToken } = require("../JwtService");
const Account = require("../../models/AccountModel");
const IAccount = require("./AccountInterface");

class EmployeeService extends IAccount {
  /**
   * Creates a new employee account.
   * @param {Object} data - The data for the new employee.
   * @returns {Promise<Object>} The result of the creation attempt.
   */
  async createAccount(data) {
    try {
      // Check if an employee with the same ID card already exists
      const checkEmployee = await Account.findOne({ user: data.id_card });
      if (checkEmployee) {
        return {
          status: "ERROR",
          message: "A account with this ID card already exists.",
        };
      }
      // If the employee is a driver, check for duplicate license
      if (data.license && data.license.trim() !== "") {
        const checkLicense = await Employee.findOne({ license: data.license });
        if (checkLicense) {
          return {
            status: "ERROR",
            message: "An employee with this license already exists.",
          };
        }
      }
      // Get all existing IDs and sort them
      const employees = await Employee.find({}, { id: 1, _id: 0 }).sort({
        id: 1,
      });

      const ids = employees.map((emp) => parseInt(emp.id.replace("E", ""), 10));

      // Find the smallest missing ID
      let newIdNumber = 1;
      for (const id of ids) {
        if (id === newIdNumber) {
          newIdNumber++;
        } else {
          break;
        }
      }
      const newId = `E${String(newIdNumber).padStart(3, "0")}`;

      // Hash the password
      const hash = bcrypt.hashSync(data.password, 10);

      // Create the new employee
      const createdEmployee = await Employee.create({
        id: newId,
        name: data.name,
        gender: data.gender,
        position: data.position,
        phone: data.phone,
        image: data.image,
        id_card: data.id_card,
        password: hash,
        salary: data.salary,
        hire_date: data.hire_date,
        license: data.license || null,
      });

      await Account.create({
        user: data.id_card,
        userType: "Employee",
        username: data.id_card,
        password: hash,
      });

      if (createdEmployee) {
        return {
          status: "OK",
          message: "Employee created successfully.",
          data: createdEmployee,
        };
      }
    } catch (e) {
      console.error("Error creating employee:", e);
      return {
        status: "ERROR",
        message: "An error occurred while creating the employee.",
        error: e, // Trả về đối tượng lỗi đầy đủ
      };
    }
  }
  /**
   * Logs in an employee account.
   * @param {Object} loginData - The login data for the employee.
   * @returns {Promise<Object>} The result of the login attempt.
   */
  async login(loginData) {
    try {
      const { id_card, password } = loginData;
      const checkEmployee = await Employee.findOne({ id_card });
      if (checkEmployee === null) {
        return {
          status: "ERROR",
          message: "No employee found with the provided ID card.",
        };
      }

      const comparePassword = bcrypt.compareSync(
        password,
        checkEmployee.password
      );
      if (!comparePassword) {
        return {
          status: "ERROR",
          message: "Incorrect ID card or password.",
        };
      }

      const access_token = await generalAccessToken({
        id: checkEmployee.id,
        id_card: checkEmployee.id_card,
        _id: checkEmployee._id,
      });
      const refresh_token = await generalRefreshToken({
        id: checkEmployee.id,
        id_card: checkEmployee.id_card,
        _id: checkEmployee._id,
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
        message: "An error occurred while logging in the employee.",
        error: e,
      };
    }
  }
  /**
   * Updates an employee account.
   * @param {Object} accountId - The ID of the employee account to update.
   * @param {Object} data - The new data for the employee.
   * @returns {Promise<Object>} The result of the update attempt.
   */
  async updateAccount(accountId, data) {
    try {
      const checkEmployee = await Employee.findOne({ _id: accountId });
      if (!checkEmployee) {
        return {
          status: "ERROR",
          message: "No employee found with the provided ID.",
        };
      }

      if (data.position === "Bus boy") {
        data.license = null;
      }

      const updatedEmployee = await Employee.findByIdAndUpdate(
        checkEmployee._id,
        data,
        { new: true }
      );

      if (!updatedEmployee) {
        return {
          status: "ERROR",
          message: "Failed to update the employee or employee not found.",
        };
      }

      return {
        status: "OK",
        message: "Employee updated successfully.",
        data: updatedEmployee,
      };
    } catch (e) {
      return {
        status: "ERROR",
        message: "An error occurred while updating the employee.",
        error: e,
      };
    }
  }
  /**
   * Changes the status of an employee account.
   * @param {Object} accountId - The ID of the employee account whose status is to be changed.
   * @returns {Promise<Object>} The result of the status change attempt.
   */
  async changeStatus(accountId) {
    try {
      const checkEmployee = await Employee.findById(accountId);
      if (!checkEmployee) {
        return {
          status: "ERROR",
          message: "No employee found with the provided ID.",
        };
      }

      const status = checkEmployee.status === "Disable" ? "Enable" : "Disable";
      const updatedEmployee = await Employee.findByIdAndUpdate(
        checkEmployee._id,
        { status: status },
        { new: true }
      );

      await Account.findOneAndUpdate(
        { user: checkEmployee.id_card },
        { status: status },
        { new: true }
      );

      if (!updatedEmployee) {
        return {
          status: "ERROR",
          message: "Failed to update the employee or employee not found.",
        };
      }

      return {
        status: "OK",
        message: "Employee change status successfully.",
        data: updatedEmployee,
      };
    } catch (e) {
      return {
        status: "ERROR",
        message: "An error occurred while updating the employee.",
        error: e,
      };
    }
  }
  /**
   * Deletes an employee account.
   * @param {Object} accountId - The ID of the employee account to delete.
   * @returns {Promise<Object>} The result of the deletion attempt.
   */
  async deleteAccount(accountId) {
    try {
      const employee = await Employee.findById(accountId);
      if (!employee) {
        return {
          status: "ERROR",
          message: "No employee found with the provided ID.",
        };
      }

      await Employee.findByIdAndDelete(accountId);

      await Account.findOneAndDelete({ user: employee.id_card });

      return {
        status: "OK",
        message: "Employee deleted successfully.",
      };
    } catch (e) {
      return {
        status: "ERROR",
        message: "An error occurred while deleting the employee.",
        error: e,
      };
    }
  }
  /**
   * Retrieves all employee accounts.
   * @returns {Promise<Object>} The list of all employee accounts.
   */
  async getAllAccounts() {
    try {
      const allEmployees = await Employee.find();
      return {
        status: "OK",
        message: "Employees retrieved successfully.",
        data: allEmployees,
      };
    } catch (e) {
      return {
        status: "ERROR",
        message: "An error occurred while retrieving the employees.",
        error: e,
      };
    }
  }
  /**
   * Retrieves details of a specific employee account.
   * @param {Object} accountId - The ID of the employee to retrieve.
   * @returns {Promise<Object>} The details of the employee account.
   */
  async getDetailAccount(accountId) {
    try {
      const employee = await Employee.findOne({ _id: accountId });

      if (!employee) {
        return {
          status: "ERROR",
          message: "No employee found with the provided ID.",
        };
      }
      return {
        status: "OK",
        message: "Employee details retrieved successfully.",
        data: employee,
      };
    } catch (e) {
      return {
        status: "ERROR",
        message: "An error occurred while retrieving the employee details.",
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

      await Employee.findOneAndUpdate(
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

module.exports = EmployeeService;
