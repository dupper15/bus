const { getDetailAccount } = require("../AccountService");

class IAccount {
  /**
   * Creates a new account.
   * @param {Object} data - The data for the new account.
   * @returns {Promise<Object>} The created account.
   */
  async createAccount(data) {
    throw new Error("Method 'createAccount' must be implemented.");
  }
  /**
   * Logs in an account.
   * @param {Object} loginData - The login data for the account.
   * @returns {Promise<Object>} The result of the login attempt.
   */
  async login(loginData) {
    throw new Error("Method 'login' must be implemented.");
  }
  /**
   * Retrieves account information.
   * @param {Object} accountId - The ID of the account to retrieve.
   * @returns {Promise<Object>} The account information.
   */
  async getDetailAccount(accountId) {
    throw new Error("Method 'getDetailAccount' must be implemented.");
  }
  /**
   * Updates account information.
   * @param {Object} accountId - The ID of the account to update.
   * @param {Object} data - The new data for the account.
   * @returns {Promise<Object>} The result of the update attempt.
   */
  async updateAccount(accountId, data) {
    throw new Error("Method 'updateAccount' must be implemented.");
  }
  /**
   * Changes the status of an account.
   * @param {Object} accountId - The ID of the account whose status is to be changed.
   * @returns {Promise<Object>} The result of the status change attempt.
   */
  async changeStatus(accountId) {
    throw new Error("Method 'changeStatus' must be implemented.");
  }
  /**
   * Deletes an account.
   * @param {Object} accountId - The ID of the account to delete.
   * @returns {Promise<Object>} The result of the deletion attempt.
   */
  async deleteAccount(accountId) {
    throw new Error("Method 'deleteAccount' must be implemented.");
  }
  /**
   * Retrieves all accounts.
   * @returns {Promise<Object>} The list of all accounts.
   */
  async getAllAccounts() {
    throw new Error("Method 'getAllAccounts' must be implemented.");
  }
  /**
   * Changes the password of an account.
   * @param {Object} data - The data containing the new password.
   * @returns {Promise<Object>} The result of the password change attempt.
   */
  async changePassword(data) {
    throw new Error("Method 'changePassword' must be implemented.");
  }
}

module.exports = IAccount;
