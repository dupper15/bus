const EmployeeService = require("../services/EmployeeService");

const createEmployee = async (req, res) => {
    try {
        const data = req.body
        const response = await EmployeeService.createEmployee(data)
        return res.status(201).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while creating the employee.',
            error: e
        })
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
        const employeeId = req.params.id
        const data = req.body
        const response = await EmployeeService.updateEmployee(data)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while updating the employee.',
            error: e
        })
    }
} 

const changeStatus = async (req, res) => {
  try {
      const employeeId = req.params.id
      const response = await EmployeeService.changeStatus(employeeId)
      return res.status(200).json(response)
  } catch (e) {
      console.error(e)
      return res.status(500).json({
          status: 'ERROR',
          message: 'An error occurred while updating the employee.',
          error: e
      })
  }
} 

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
        const data = req.body;
        const response = await EmployeeService.getDetailEmployee(data)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while retrieving the employee details.',
            error: e
        })
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
        const employeeId = req.params.id
        const response = await EmployeeService.deleteEmployee(employeeId)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while deleting the employee.',
            error: e
        })
    }
};

module.exports = {
  createEmployee,
  loginEmployee,
  updateEmployee,
  changeStatus,
  getAllEmployee,
  getDetailEmployee,
  refreshTokenJwtEmployee,
  deleteEmployee,
};
