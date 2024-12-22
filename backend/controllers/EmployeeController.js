const EmployeeService = require("../services/EmployeeService");

const createEmployee = async (req, res) => {
  try {
    console.log("hello", req.body);
    const {
      name,
      id_card,
      password,
      confirmPassword,
      phone,
      salary,
      position,
      license,
    } = req.body;
    if (
      !name ||
      !id_card ||
      !password ||
      !confirmPassword ||
      !phone ||
      !salary
    ) {
      return res.status(400).json({
        status: "ERROR",
        message: "All fields are required.",
      });
    } else if (!/^\d{12}$/.test(id_card)) {
      return res.status(400).json({
        status: "ERROR",
        message: "ID card must be exactly 12 digits.",
      });
    } else if (password !== confirmPassword) {
      return res.status(400).json({
        status: "ERROR",
        message: "Password and confirm password do not match.",
      });
    }
    if (position == "driver" && !license) {
      return res.status(400).json({
        status: "ERROR",
        message: "License is required for drivers.",
      });
    }
    const response = await EmployeeService.createEmployee(req.body);
    return res.status(201).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "ERROR",
      message: "An error occurred while creating the employee.",
      error: e,
    });
  }
};

const loginEmployee = async (req, res) => {
  try {
    const { id_card, password } = req.body;
    if (!id_card || !password) {
      return res.status(400).json({
        status: "ERROR",
        message: "ID card and password are required.",
      });
    }
    const response = await EmployeeService.loginEmployee(req.body);
    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "ERROR",
      message: "An error occurred while logging in the employee.",
      error: e,
    });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const EmployeeId = req.params.id;
    const data = req.body;
    if (!EmployeeId) {
      return res.status(400).json({
        status: "ERROR",
        message: "Employee ID is required.",
      });
    }
    const response = await EmployeeService.updateEmployee(EmployeeId, data);
    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "ERROR",
      message: "An error occurred while updating the employee.",
      error: e,
    });
  }
};

const getAllEmployee = async (req, res) => {
  try {
    const response = await EmployeeService.getAllEmployee();
    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "ERROR",
      message: "An error occurred while retrieving the employees.",
      error: e,
    });
  }
};

const getDetailEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    if (!employeeId) {
      return res.status(400).json({
        status: "ERROR",
        message: "Employee ID is required.",
      });
    }
    const response = await EmployeeService.getDetailEmployee(employeeId);
    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "ERROR",
      message: "An error occurred while retrieving the employee details.",
      error: e,
    });
  }
};

const refreshTokenJwtEmployee = async (req, res) => {
  try {
    const token = req.headers.token.split(" ")[1];
    if (!token) {
      return res.status(400).json({
        status: "ERROR",
        message: "Token is required.",
      });
    }
    const response = await JwtService.refreshTokenJwtEmployee(token);
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

const deleteEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    if (!employeeId) {
      return res.status(400).json({
        status: "ERROR",
        message: "Employee ID is required.",
      });
    }
    const response = await EmployeeService.deleteEmployee(employeeId);
    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: "ERROR",
      message: "An error occurred while deleting the employee.",
      error: e,
    });
  }
};

module.exports = {
  createEmployee,
  loginEmployee,
  updateEmployee,
  getAllEmployee,
  getDetailEmployee,
  refreshTokenJwtEmployee,
  deleteEmployee,
};
