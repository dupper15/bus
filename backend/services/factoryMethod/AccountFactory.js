const CustomerService = require("./CustomerService");
const EmployeeService = require("./EmployeeService");
const ManagerService = require("./ManagerService");

class AccountFactory {
  /**
   * Creates an account service based on the user type.
   * @param {string} userType - The type of user (Customer, Employee, Manager).
   * @returns {Object} An instance of the corresponding account service.
   */
  static createAccountService(userType) {
    switch (userType) {
      case "Customer":
        return new CustomerService();
      case "Employee":
        return new EmployeeService();
      case "Manager":
        return new ManagerService();
      default:
        throw new Error("Invalid user type");
    }
  }
}

module.exports = AccountFactory;
