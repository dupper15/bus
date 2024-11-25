const DayOff = require("../models/DayOffModel")

const createDayOff = (newDayOff) => {
    return new Promise(async (resolve, reject) => {
        const {employee, solver, content, status, date_requested} = newDayOff
        try {
            const checkDayOff = await DayOff.findOne({
                employee: employee, solver: solver, content: content, date_requested: date_requested
            })
            if (checkDayOff !== null) {
                resolve({
                    status: "ERROR", message: "A dayOff with this information already exists."
                })
                return;
            }

            const createdDayOff = await DayOff.create({
                employee: employee, solver: solver, content: content, date_requested: date_requested, status: status
            })
            if (createdDayOff) {
                resolve({
                    status: "OK", message: "DayOff created successfully.", data: createdDayOff
                })
            }
        } catch (e) {
            reject({
                status: "ERROR", message: "An error occurred while creating the dayOff.", error: e
            })
        }
    })
}

const getAllDayOff = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allDayOff = await DayOff.find();
            resolve({
                status: "OK", message: "DayOffs retrieved successfully.", data: allDayOff
            })

        } catch (e) {
            reject({
                status: "ERROR", message: "An error occurred while retrieving the dayOffs.", error: e
            })
        }
    })
}

const updateDayOff = (DayOffId, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkDayOff = await DayOff.findOne({_id: DayOffId});
            if (checkDayOff === null) {
                resolve({
                    status: "ERROR", message: "No dayOff found with the provided ID."
                })
                return;
            }

            const updatedDayOff = await DayOff.findByIdAndUpdate(DayOffId, data, {new: true});

            if (!updatedDayOff) {
                resolve({
                    status: "ERROR", message: "Failed to update the dayOff or dayOff not found."
                });
                return;
            }

            resolve({
                status: "OK", message: "DayOff updated successfully.", data: updatedDayOff
            })

        } catch (e) {
            reject({
                status: "ERROR", message: "An error occurred while updating the dayOff.", error: e
            })
        }
    })
}

const getDetailDayOff = (DayOffId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const dayOff = await DayOff.findOne({
                _id: DayOffId
            })
            if (dayOff === null) {
                resolve({
                    status: 'ERROR', message: 'No dayOff found with the provided ID.'
                })
                return;
            }
            resolve({
                status: "OK", message: "DayOff details retrieved successfully.", data: dayOff
            })

        } catch (e) {
            reject({
                status: "ERROR", message: "An error occurred while retrieving the dayOff details.", error: e
            })
        }
    })
}

const deleteDayOff = (DayOffId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const dayOff = await DayOff.findOne({
                _id: DayOffId
            })
            if (dayOff === null) {
                resolve({
                    status: 'ERROR', message: 'No dayOff found with the provided ID.'
                })
                return;
            }

            await DayOff.findByIdAndDelete(DayOffId)
            resolve({
                status: "OK", message: "DayOff deleted successfully.",
            })

        } catch (e) {
            reject({
                status: "ERROR", message: "An error occurred while deleting the dayOff.", error: e
            })
        }
    })
}

module.exports = {
    createDayOff, getAllDayOff, updateDayOff, getDetailDayOff, deleteDayOff
}