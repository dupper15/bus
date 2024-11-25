const Customer = require("../models/CustomerModel")
const bcrypt =  require("bcrypt")
const { generalAccessToken, generalRefreshToken } = require("./jwtService")

const createCustomer = (newCustomer) => {
    return new Promise(async (resolve, reject) => {
        const { name, image, id_card, password, confirmPassword, phone} = newCustomer
        try {
            const checkCustomer = await Customer.findOne({
                id_card: id_card
            })
            if (checkCustomer !== null){
                resolve({
                    status: "ERROR",
                    message: "A customer with this ID card already exists."
                })
                return;
            }

            const hash = bcrypt.hashSync(password, 10)

            const createdCustomer = await Customer.create({
                name,
                image,
                id_card,
                password: hash,
                confirmPassword: hash,
                phone
            })
            if (createdCustomer){
                resolve({
                    status: "OK",
                    message: "Customer created successfully.",
                    data: createdCustomer
                })
            }
        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while creating the customer.",
                error: e
            })
        }
    })
}

const loginCustomer = (customerLogin) => {
    return new Promise(async (resolve, reject) => {
        const {id_card, password} = customerLogin
        try {
            const checkCustomer = await Customer.findOne({
                id_card: id_card
            })
            if (checkCustomer === null){
                resolve({
                    status: "ERROR",
                    message: "No customer found with the provided ID card."
                })
                return;
            }

            const comparePassword = bcrypt.compareSync(password, checkCustomer.password)
            if (!comparePassword){
                resolve({
                    status: "ERROR",
                    message: "Incorrect ID card or password."
                })
                return;
            }

            const access_token =  await generalAccessToken({
                id: checkCustomer.id,
            })
            const refresh_token = await generalRefreshToken({
                id: checkCustomer.id,
            })

            resolve({
                status: "OK",
                message: "Login successful.",
                access_token,
                refresh_token
            })

        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while logging in the customer.",
                error: e
            })
        }
    })
}

const updateCustomer = (customerId, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkCustomer = await Customer.findOne({ _id: customerId });
            if (checkCustomer === null){
                resolve({
                    status: "ERROR",
                    message: "No customer found with the provided ID."
                })
                return;
            }

            const updatedCustomer = await Customer.findByIdAndUpdate(customerId, data, { new: true });

            if (!updatedCustomer) {
                resolve({
                    status: "ERROR",
                    message: "Failed to update the customer or customer not found."
                });
                return;
            }

            resolve({
                status: "OK",
                message: "Customer updated successfully.",
                data: updatedCustomer
            })

        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while updating the customer.",
                error: e
            })
        }
    })
}

const getAllCustomer = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allCustomer = await Customer.find();
            resolve({
                status: "OK",
                message: "Customers retrieved successfully.",
                data: allCustomer
            })

        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while retrieving the customers.",
                error: e
            })
        }
    })
}

const getDetailCustomer = (customerId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const customer = await Customer.findOne({
                _id: customerId
            })
            if (customer === null){
                resolve({
                    status: 'ERROR',
                    message: 'No customer found with the provided ID.'
                })
                return;
            }
            resolve({
                status: "OK",
                message: "Customer details retrieved successfully.",
                data: customer
            })

        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while retrieving the customer details.",
                error: e
            })
        }
    })
}

module.exports = {
    createCustomer,
    loginCustomer,
    updateCustomer,
    getAllCustomer,
    getDetailCustomer,
}