const AccountFactory = require("../services/factoryMethod/AccountFactory");
const AccountService = AccountFactory.createAccountService("Manager");
const JwtService = require("../services/JwtService");

const createManager = async (req, res) => {
  try {
    const data = req.body;
    const response = await AccountService.createAccount(data);
    return res.status(201).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "ERROR",
      message: "An error occurred while creating the manager.",
      error: e,
    });
  }
};

const loginManager = async (req, res) => {
  try {
    const { id_card, password } = req.body;
    if (!id_card || !password) {
      return res.status(400).json({
        status: "ERROR",
        message: "ID card and password are required.",
      });
    }
    const response = await AccountService.login(req.body);
    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "ERROR",
      message: "An error occurred while logging in the manager.",
      error: e,
    });
  }
};

const updateManager = async (req, res) => {
  try {
    const managerId = req.params.id;
    const data = req.body;
    const response = await AccountService.updateAccount(managerId, data);
    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "ERROR",
      message: "An error occurred while updating the manager.",
      error: e,
    });
  }
};

const changeStatusManager = async (req, res) => {
  try {
    const managerId = req.params.id;
    if (!managerId) {
      return res.status(400).json({
        status: "ERROR",
        message: "Manager ID is required.",
      });
    }
    const response = await AccountService.changeStatus(managerId);
    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "ERROR",
      message: "An error occurred while updating the manager.",
      error: e,
    });
  }
};

const deleteManager = async (req, res) => {
  try {
    const managerId = req.params.id;
    if (!managerId) {
      return res.status(400).json({
        status: "ERROR",
        message: "Manager ID is required.",
      });
    }

    const response = await AccountService.deleteAccount(managerId);
    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "ERROR",
      message: "An error occurred while updating the manager.",
      error: e,
    });
  }
};

const getAllManager = async (req, res) => {
  try {
    const response = await AccountService.getAllAccounts();
    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "ERROR",
      message: "An error occurred while retrieving the managers.",
      error: e,
    });
  }
};

const getDetailManager = async (req, res) => {
  try {
    const managerId = req.params.id;
    if (!managerId) {
      return res.status(400).json({
        status: "ERROR",
        message: "Manager ID is required.",
      });
    }
    const response = await AccountService.getDetailAccount(managerId);
    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "ERROR",
      message: "An error occurred while retrieving the manager details.",
      error: e,
    });
  }
};

const refreshTokenJwtManager = async (req, res) => {
  try {
    const token = req.headers.token.split(" ")[1];
    if (!token) {
      return res.status(400).json({
        status: "ERROR",
        message: "Token is required.",
      });
    }
    const response = await JwtService.refreshTokenJwtManager(token);
    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "ERROR",
      message: "An error occurred while refreshing the token.",
      error: e,
    });
  }
};

module.exports = {
  createManager,
  loginManager,
  updateManager,
  changeStatusManager,
  deleteManager,
  getAllManager,
  getDetailManager,
  refreshTokenJwtManager,
};
