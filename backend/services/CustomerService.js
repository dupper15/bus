const Customer = require("../models/CustomerModel")
const bcrypt =  require("bcrypt")
const { generalAccessToken, generalRefreshToken } = require("./jwtService")
const Account = require("../models/AccountModel")

const createCustomer = async (data) => {
    try {
        const existingCustomer = await Account.findOne({ user: data.id_card });
        if (existingCustomer) {
            return {
                status: "ERROR",
                message: "A account with this ID card already exists."
            };
        }

        const hashedPassword = bcrypt.hashSync(data.password, 10);

        // Get all existing IDs and sort them
        const customers = await Customer.find({}, { id: 1, _id: 0 }).sort({ id: 1 });

        const ids = customers.map((emp) => parseInt(emp.id.replace('C', ''), 10));

        // Find the smallest missing ID
        let newIdNumber = 1;
        for (const id of ids) {
            if (id === newIdNumber) {
                newIdNumber++;
            } else {
                break;
            }
        }
        const newId = `C${String(newIdNumber).padStart(3, '0')}`;

        const createdCustomer = await Customer.create({
            id: newId,
            name: data.name,
            gender: data.gender,
            image: data.image,
            phone: data.phone,
            id_card: data.id_card,
            username: data.username,
            password: hashedPassword,
        });

        await Account.create({
            user: createdCustomer.id_card,
            userType: "Customer", 
            username: data.username,
            password: hashedPassword,
        });

        return {
            status: "OK",
            message: "Customer created successfully.",
            data: createdCustomer
        };

    } catch (error) {
        return {
            status: "ERROR",
            message: "An error occurred while creating the customer.",
            error: error.message
        };
    }
};


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

const changeStatus = async (customerId) => {
    try {
        const checkCustomer = await Customer.findOne({ _id: customerId });
        if (!checkCustomer) {
            return {
                status: "ERROR",
                message: "No customer found with the provided ID."
            };
        }

        const status = checkCustomer.status === "Disable" ? "Enable" : "Disable";

        const updatedCustomer = await Customer.findByIdAndUpdate(
            customerId,
            { status: status },
            { new: true }
        );

        const account = await Account.findOne({ user: checkCustomer.id_card });
        account.status = status;
        account.save();

        if (!updatedCustomer) {
            return {
                status: "ERROR",
                message: "Failed to update the customer or customer not found."
            };
        }

        await Account.findOneAndUpdate(
            { user: checkCustomer.id_card },
            { status: status },
            { new: true }
        );

        return {
            status: "OK",
            message: "Customer updated successfully.",
            data: updatedCustomer
        };
    } catch (e) {
        return {
            status: "ERROR",
            message: "An error occurred while updating the customer.",
            error: e
        };
    }
};

const deleteCustomer = async (customerId) => {
    try {
        const checkCustomer = await Customer.findOne({ _id: customerId });
        if (!checkCustomer) {
            return {
                status: "ERROR",
                message: "No customer found with the provided ID."
            };
        }

        await Customer.findByIdAndDelete(customerId);
        await Account.findOneAndDelete({ user: checkCustomer.id_card });

        return {
            status: "OK",
            message: "Customer deleted successfully.",
        };
    } catch (e) {
        return {
            status: "ERROR",
            message: "An error occurred while updating the customer.",
            error: e
        };
    }
};

// const updatePasswordCustomer = (customerId, password) => {
//     // This function is not implemented in the service layer.
// }

const getAllCustomer = async () => {
    try {
        const allCustomer = await Customer.find();
        return {
            status: "OK",
            message: "Customers retrieved successfully.",
            data: allCustomer
        };
    } catch (e) {
        return {
            status: "ERROR",
            message: "An error occurred while retrieving the customers.",
            error: e
        };
    }
};

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
    changeStatus,
    deleteCustomer,
    // updatePasswordCustomer,
    getAllCustomer,
    getDetailCustomer,
}