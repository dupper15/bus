const Reward_Punishment = require("../models/Reward_PunishmentModel")

const createReward_Punishment = (newReward_Punishment) => {
    return new Promise(async (resolve, reject) => {
        const {employee, content, type, date, price} = newReward_Punishment
        try {
            const checkReward_Punishment = await Reward_Punishment.findOne({
                employee: employee, content: content, type: type, date: date, price: price
            })
            if (checkReward_Punishment !== null) {
                resolve({
                    status: "ERROR", message: "A reward_punishment with this information already exists."
                })
                return;
            }

            const createdReward_Punishment = await Reward_Punishment.create({
                employee: employee, content: content, type: type, date: date, price: price
            })
            if (createdReward_Punishment) {
                resolve({
                    status: "OK", message: "Reward_Punishment created successfully.", data: createdReward_Punishment
                })
            }
        } catch (e) {
            reject({
                status: "ERROR", message: "An error occurred while creating the reward_punishment.", error: e
            })
        }
    })
}

const getAllReward_Punishment = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allReward_Punishment = await Reward_Punishment.find();
            resolve({
                status: "OK", message: "Reward_Punishments retrieved successfully.", data: allReward_Punishment
            })

        } catch (e) {
            reject({
                status: "ERROR", message: "An error occurred while retrieving the reward_punishments.", error: e
            })
        }
    })
}

const updateReward_Punishment = (Reward_PunishmentId, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkReward_Punishment = await Reward_Punishment.findOne({_id: Reward_PunishmentId});
            if (checkReward_Punishment === null) {
                resolve({
                    status: "ERROR", message: "No reward_punishment found with the provided ID."
                })
                return;
            }

            const updatedReward_Punishment = await Reward_Punishment.findByIdAndUpdate(Reward_PunishmentId, data, {new: true});

            if (!updatedReward_Punishment) {
                resolve({
                    status: "ERROR", message: "Failed to update the reward_punishment or reward_punishment not found."
                });
                return;
            }

            resolve({
                status: "OK", message: "Reward_Punishment updated successfully.", data: updatedReward_Punishment
            })

        } catch (e) {
            reject({
                status: "ERROR", message: "An error occurred while updating the reward_punishment.", error: e
            })
        }
    })
}

const getDetailReward_Punishment = (Reward_PunishmentId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const reward_punishment = await Reward_Punishment.findOne({
                _id: Reward_PunishmentId
            })
            if (reward_punishment === null) {
                resolve({
                    status: 'ERROR', message: 'No reward_punishment found with the provided ID.'
                })
                return;
            }
            resolve({
                status: "OK", message: "Reward_Punishment details retrieved successfully.", data: reward_punishment
            })

        } catch (e) {
            reject({
                status: "ERROR", message: "An error occurred while retrieving the reward_punishment details.", error: e
            })
        }
    })
}

const deleteReward_Punishment = (Reward_PunishmentId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const reward_punishment = await Reward_Punishment.findOne({
                _id: Reward_PunishmentId
            })
            if (reward_punishment === null) {
                resolve({
                    status: 'ERROR', message: 'No reward_punishment found with the provided ID.'
                })
                return;
            }

            await Reward_Punishment.findByIdAndDelete(Reward_PunishmentId)
            resolve({
                status: "OK", message: "Reward_Punishment deleted successfully.",
            })

        } catch (e) {
            reject({
                status: "ERROR", message: "An error occurred while deleting the reward_punishment.", error: e
            })
        }
    })
}

module.exports = {
    createReward_Punishment, getAllReward_Punishment, updateReward_Punishment, getDetailReward_Punishment, deleteReward_Punishment
}