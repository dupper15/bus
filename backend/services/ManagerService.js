const Manager = require("../models/ManagerModel")
const bcrypt = require("bcrypt")
const { generalAccessToken, generalRefreshToken } = require("./jwtService")

const createManager = (newManager) => {
    return new Promise(async (resolve, reject) => {
        const { name, image, id_card, password, phone } = newManager
        try {
            const checkManager = await Manager.findOne({ id_card })
            if (checkManager !== null) {
                resolve({
                    status: "ERROR",
                    message: "A manager with this ID card already exists."
                })
                return;
            }

            const hash = bcrypt.hashSync(password, 10)

            const createdManager = await Manager.create({
                name,
                image,
                id_card,
                password: hash,
                phone
            })
            if (createdManager) {
                resolve({
                    status: "OK",
                    message: "Manager created successfully.",
                    data: createdManager
                })
            }
        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while creating the manager.",
                error: e
            })
        }
    })
}

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

const updateManager = (managerId, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkManager = await Manager.findOne({ _id: managerId });
            if (checkManager === null) {
                resolve({
                    status: "ERROR",
                    message: "No manager found with the provided ID."
                })
                return;
            }

            const updatedManager = await Manager.findByIdAndUpdate(managerId, data, { new: true });

            if (!updatedManager) {
                resolve({
                    status: "ERROR",
                    message: "Failed to update the manager or manager not found."
                });
                return;
            }

            resolve({
                status: "OK",
                message: "Manager updated successfully.",
                data: updatedManager
            })

        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while updating the manager.",
                error: e
            })
        }
    })
}

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
    getAllManager,
    getDetailManager,
}