const AccountServiceProxy = require("../proxy/AccountServiceProxy");
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
    let realService;
    switch (userType) {
      case "Customer":
        realService = new CustomerService();
        break;
      case "Employee":
        realService = new EmployeeService();
        break;
      case "Manager":
        realService = new ManagerService();
        break;
      default:
        throw new Error("Invalid user type");
    }
    return new AccountServiceProxy(realService);
  }
}

module.exports = AccountFactory;
