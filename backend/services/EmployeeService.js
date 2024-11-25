const Employee = require("../models/EmployeeModel")
const bcrypt = require("bcrypt")
const {generalAccessToken, generalRefreshToken} = require("./jwtService")

const createEmployee = (newEmployee) => {
    return new Promise(async (resolve, reject) => {
        const {name, image, id_card, password, phone, salary, isDriver, license} = newEmployee
        try {
            const checkEmployee = await Employee.findOne({id_card})
            if (checkEmployee !== null) {
                resolve({
                    status: "ERROR", message: "An employee with this ID card already exists."
                })
                return;
            }

            if (isDriver) {
                const existingLicense = await Employee.findOne({license});
                if (existingLicense) {
                    resolve({
                        status: "ERROR", message: "An employee with this license already exists."
                    });
                    return;
                }
            }

            const hash = bcrypt.hashSync(password, 10)

            const createdEmployee = await Employee.create({
                name, image, id_card, password: hash, confirmPassword: hash, phone, salary, isDriver, license
            })
            if (createdEmployee) {
                resolve({
                    status: "OK", message: "Employee created successfully.", data: createdEmployee
                })
            }
        } catch (e) {
            reject({
                status: "ERROR", message: "An error occurred while creating the employee.", error: e
            })
        }
    })
}

const loginEmployee = (EmployeeLogin) => {
    return new Promise(async (resolve, reject) => {
        const {id_card, password} = EmployeeLogin
        try {
            const checkEmployee = await Employee.findOne({id_card})
            if (checkEmployee === null) {
                resolve({
                    status: "ERROR", message: "No employee found with the provided ID card."
                })
                return;
            }

            const comparePassword = bcrypt.compareSync(password, checkEmployee.password)
            if (!comparePassword) {
                resolve({
                    status: "ERROR", message: "Incorrect ID card or password."
                })
                return;
            }

            const access_token = await generalAccessToken({id: checkEmployee.id})
            const refresh_token = await generalRefreshToken({id: checkEmployee.id})

            resolve({
                status: "OK", message: "Login successful.", access_token, refresh_token
            })

        } catch (e) {
            reject({
                status: "ERROR", message: "An error occurred while logging in the employee.", error: e
            })
        }
    })
}

const updateEmployee = (EmployeeId, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkEmployee = await Employee.findOne({_id: EmployeeId});
            if (checkEmployee === null) {
                resolve({
                    status: "ERROR", message: "No employee found with the provided ID."
                })
                return;
            }

            const updatedEmployee = await Employee.findByIdAndUpdate(EmployeeId, data, {new: true});

            if (!updatedEmployee) {
                resolve({
                    status: "ERROR", message: "Failed to update the employee or employee not found."
                });
                return;
            }

            resolve({
                status: "OK", message: "Employee updated successfully.", data: updatedEmployee
            })

        } catch (e) {
            reject({
                status: "ERROR", message: "An error occurred while updating the employee.", error: e
            })
        }
    })
}

const getAllEmployee = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allEmployee = await Employee.find();
            resolve({
                status: "OK", message: "Employees retrieved successfully.", data: allEmployee
            })

        } catch (e) {
            reject({
                status: "ERROR", message: "An error occurred while retrieving the employees.", error: e
            })
        }
    })
}

const getDetailEmployee = (EmployeeId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const employee = await Employee.findOne({_id: EmployeeId})
            if (employee === null) {
                resolve({
                    status: 'ERROR', message: 'No employee found with the provided ID.'
                })
                return;
            }
            resolve({
                status: "OK", message: "Employee details retrieved successfully.", data: employee
            })

        } catch (e) {
            reject({
                status: "ERROR", message: "An error occurred while retrieving the employee details.", error: e
            })
        }
    })
}

const deleteEmployee = (employeeId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const employee = await Employee.findOne({_id: employeeId})
            if (employee === null) {
                resolve({
                    status: 'ERROR', message: 'No employee found with the provided ID.'
                })
                return;
            }
            await Employee.findByIdAndDelete(employeeId)
            resolve({
                status: "OK", message: "Employee deleted successfully.",
            })

        } catch (e) {
            reject({
                status: "ERROR", message: "An error occurred while deleting the employee.", error: e
            })
        }
    })
}

module.exports = {
    createEmployee, loginEmployee, updateEmployee, getAllEmployee, getDetailEmployee, deleteEmployee
}