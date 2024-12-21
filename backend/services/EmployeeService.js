const Employee = require("../models/EmployeeModel")
const bcrypt = require("bcrypt")
const {generalAccessToken, generalRefreshToken} = require("./jwtService")

const createEmployee = async (data) => {
    try {
        // Check if an employee with the same ID card already exists
        const checkEmployee = await Employee.findOne({ id_card: data.id_card });
        if (checkEmployee) {
            return {
                status: "ERROR",
                message: "An employee with this ID card already exists."
            };
        }
        // If the employee is a driver, check for duplicate license
        if (data.license) {
            const checkLicense = await Employee.findOne({ license: data.license });
            if (checkLicense) {
                return {
                    status: "ERROR",
                    message: "An employee with this license already exists."
                };
            }
        }        
        // Get all existing IDs and sort them
        const employees = await Employee.find({}, { id: 1, _id: 0 }).sort({ id: 1 });
        const ids = employees.map((emp) => parseInt(emp.id.replace('E', ''), 10));

        // Find the smallest missing ID
        let newIdNumber = 1;
        for (const id of ids) {
            if (id === newIdNumber) {
                newIdNumber++;
            } else {
                break;
            }
        }
        const newId = `E${String(newIdNumber).padStart(3, '0')}`;


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
            license: data.license || null
        });
  
        if (createdEmployee) {
            return {
                status: "OK",
                message: "Employee created successfully.",
                data: createdEmployee
            };
        }
    } catch (e) {
        return {
            status: "ERROR",
            message: "An error occurred while creating the employee.",
            error: e // Trả về đối tượng lỗi đầy đủ
        };
    }
};


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

const updateEmployee = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkEmployee = await Employee.findOne({id: data.id});
            if (checkEmployee === null) {
                resolve({
                    status: "ERROR", 
                    message: "No employee found with the provided ID."
                })
                return;
            }
            const updatedEmployee = await Employee.findByIdAndUpdate(checkEmployee._id, data, {new: true});
            if (!updatedEmployee) {
                resolve({
                    status: "ERROR", 
                    message: "Failed to update the employee or employee not found."
                });
                return;
            }

            resolve({
                status: "OK", 
                message: "Employee updated successfully.", 
                data: updatedEmployee
            })

        } catch (e) {
            reject({
                status: "ERROR", 
                message: "An error occurred while updating the employee.", 
                error: e
            })
        }
    })
}

const getAllEmployee = async () => {
    try {
        const allEmployees = await Employee.find();
        return {
            status: "OK",
            message: "Employees retrieved successfully.",
            data: allEmployees
        };
    } catch (e) {
        return {
            status: "ERROR",
            message: "An error occurred while retrieving the employees.",
            error: e
        };
    }
};

const getDetailEmployee = async (data) => {
    try {
        const employee = await Employee.findOne({ id: data.id });

        if (!employee) {
            return {
                status: "ERROR",
                message: "No employee found with the provided ID."
            };
        }
        return {
            status: "OK",
            message: "Employee details retrieved successfully.",
            data: employee
        };
    } catch (e) {
        return {
            status: "ERROR",
            message: "An error occurred while retrieving the employee details.",
            error: e
        };
    }
};

const deleteEmployee = async (data) => {
    try {
        const employee = await Employee.findOne({ id: data.id });
        if (!employee) {
            return {
                status: "ERROR",
                message: "No employee found with the provided ID."
            };
        }
        await Employee.findOneAndDelete({ id: data.id });
        
        return {
            status: "OK",
            message: "Employee deleted successfully."
        };
    } catch (e) {
        return {
            status: "ERROR",
            message: "An error occurred while deleting the employee.",
            error: e
        };
    }
};


module.exports = {
    createEmployee, 
    loginEmployee, 
    updateEmployee, 
    getAllEmployee, 
    getDetailEmployee, 
    deleteEmployee
}