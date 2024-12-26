const Manager = require("../models/ManagerModel")
const bcrypt = require("bcrypt")
const { generalAccessToken, generalRefreshToken } = require("./jwtService")
const Account = require("../models/AccountModel")

const createManager = async (data) => {
    try {
        const checkManager = await Account.findOne({ user: data.id_card });
        if (checkManager) {
            return {
                status: "ERROR",
                message: "A manager with this ID card already exists."
            };
        }

        const hash = bcrypt.hashSync(data.password, 10);

        // Get all existing IDs and sort them
        const managers = await Manager.find({}, { id: 1, _id: 0 }).sort({ id: 1 });

        const ids = managers.map((mgr) => parseInt(mgr.id.replace('M', ''), 10));

        // Find the smallest missing ID
        let newIdNumber = 1;
        for (const id of ids) {
            if (id === newIdNumber) {
                newIdNumber++;
            } else {
                break;
            }
        }
        const newId = `M${String(newIdNumber).padStart(3, '0')}`;

        const createdManager = await Manager.create({
            id: newId,
            name: data.name,
            gender: data.gender,
            image: data.image,
            id_card: data.id_card,
            username: data.username,
            password: hash,
            phone: data.phone
        });

        await Account.create({
            user: data.id_card,
            userType: "Manager",
            username: data.username,
            password: hash,
        });

        return {
            status: "OK",
            message: "Manager created successfully.",
            data: createdManager
        };

    } catch (e) {
        return {
            status: "ERROR",
            message: "An error occurred while creating the manager.",
            error: e
        };
    }
};

const loginManager = (ManagerLogin) => {
    return new Promise(async (resolve, reject) => {
        const { id_card, password } = ManagerLogin
        try {
            const checkManager = await Manager.findOne({ id_card })
            if (checkManager === null) {
                resolve({
                    status: "ERROR",
                    message: "No manager found with the provided ID card."
                })
                return;
            }

            const comparePassword = bcrypt.compareSync(password, checkManager.password)
            if (!comparePassword) {
                resolve({
                    status: "ERROR",
                    message: "Incorrect ID card or password."
                })
                return;
            }

            const access_token = await generalAccessToken({ id: checkManager.id })
            const refresh_token = await generalRefreshToken({ id: checkManager.id })

            resolve({
                status: "OK",
                message: "Login successful.",
                access_token,
                refresh_token
            })

        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while logging in the manager.",
                error: e
            })
        }
    })
}

const updateManager = async (data) => {
    try {
        const checkManager = await Manager.findOne({ id_card: data.id_card });
        if (!checkManager) {
            return {
                status: "ERROR",
                message: "No manager found with the provided ID."
            };
        }

        const updatedManager = await Manager.findByIdAndUpdate(
            checkManager._id, 
            data, 
            { new: true }
        );

        if (!updatedManager) {
            return {
                status: "ERROR",
                message: "Failed to update the manager or manager not found."
            };
        }

        return {
            status: "OK",
            message: "Manager updated successfully.",
            data: updatedManager
        };

    } catch (e) {
        return {
            status: "ERROR",
            message: "An error occurred while updating the manager.",
            error: e
        };
    }
};

const changeStatusManager = async (managerId) => {
    try {
        const checkManager = await Manager.findById(managerId);
        if (!checkManager) {
            return {
                status: "ERROR",
                message: "No manager found with the provided ID."
            };
        }

        const status = checkCustomer.status === "Disable" ? "Enable" : "Disable";

        const updatedManager = await Manager.findByIdAndUpdate(
            managerId, 
            { status: status },
            { new: true }
        );

        if (!updatedManager) {
            return {
                status: "ERROR",
                message: "Failed to update the manager or manager not found."
            };
        }

        return {
            status: "OK",
            message: "Manager changed status successfully.",
            data: updatedManager
        };

    } catch (e) {
        return {
            status: "ERROR",
            message: "An error occurred while updating the manager.",
            error: e
        };
    }
};

const deleteManager = async (managerId) => {
    try {
        const checkManager = await Manager.findById(managerId);
        if (!checkManager) {
            return {
                status: "ERROR",
                message: "No manager found with the provided ID."
            };
        }

        await Manager.findByIdAndDelete(managerId);
        await Account.findOneAndDelete({ user: checkManager.id_card });

        return {
            status: "OK",
            message: "Deleted manager successfully.",
        };

    } catch (e) {
        return {
            status: "ERROR",
            message: "An error occurred while updating the manager.",
            error: e
        };
    }
};


const getAllManager = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allManager = await Manager.find();
            resolve({
                status: "OK",
                message: "Managers retrieved successfully.",
                data: allManager
            })

        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while retrieving the managers.",
                error: e
            })
        }
    })
}

const getDetailManager = (ManagerId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const manager = await Manager.findOne({ _id: ManagerId })
            if (manager === null) {
                resolve({
                    status: 'ERROR',
                    message: 'No manager found with the provided ID.'
                })
                return;
            }
            resolve({
                status: "OK",
                message: "Manager details retrieved successfully.",
                data: manager
            })

        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while retrieving the manager details.",
                error: e
            })
        }
    })
}

module.exports = {
    createManager,
    loginManager,
    updateManager,
    changeStatusManager,
    deleteManager,
    getAllManager,
    getDetailManager,
}