const AccountService = require("../services/factoryMethod/AccountService");
const JwtService = require("../services/JwtService");

const loginAccount = async (req, res) => {
  try {
    const data = req.body;
    const response = await AccountService.loginAccount(data);
    const { refresh_token, ...newResponse } = response;
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });
    return res.status(201).json(newResponse);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "ERROR",
      message: "An error occurred while login.",
    });
  }
};

const getDetailAccount = async (req, res) => {
  try {
    const response = await AccountService.getDetailAccount({
      _id: req.account._id,
      id_card: req.account.id_card,
    });
    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "ERROR",
      message: "An error occurred while creating the bus.",
    });
  }
};

const logoutAccount = async (req, res) => {
  try {
    res.clearCookie("refresh_token");
    return res.status(200).json({
      status: "OK",
      message: "Logout successfully",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "ERROR",
      message: "An error occurred while updating the bus.",
    });
  }
};

const refreshTokenJwt = async (req, res) => {
  try {
    const token = req.cookies.refresh_token;
    console.log(token);
    if (!token) {
      return res.status(400).json({
        status: "ERROR",
        message: "Token is required.",
      });
    }
    const response = await JwtService.refreshTokenJwt(token);
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

const changePassword = async (req, res) => {
  try {
    const data = req.body;
    const response = await AccountService.changePassword(data);
    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "ERROR",
      message: "An error occurred while changing the password.",
      error: e,
    });
  }
};

const updateAccount = async (req, res) => {
  try {
    const data = req.body;
    const response = await AccountService.updateAccount(data);
    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "ERROR",
      message: "An error occurred while changing the password.",
      error: e,
    });
  }
};

module.exports = {
  loginAccount,
  getDetailAccount,
  logoutAccount,
  refreshTokenJwt,
  changePassword,
  updateAccount,
};
