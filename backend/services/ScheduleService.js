const Schedule = require("../models/ScheduleModel")

const createSchedule = (newSchedule) => {
    return new Promise(async (resolve, reject) => {
        const {bus, line, driver, busboy, time_start, status} = newSchedule
        try {
            const checkSchedule = await Schedule.findOne({
                bus: bus, line: line, driver: driver, busboy: busboy, time_start: time_start,
            })
            if (checkSchedule !== null) {
                resolve({
                    status: "ERROR", message: "A schedule with this information already exists."
                })
                return;
            }

            // Check if the bus, line, driver, and busboy exist
            // const
            // Check if the driver and busboy are actually drivers and busboys
            // const

            const createdSchedule = await Schedule.create({
                bus: bus, line: line, driver: driver, busboy: busboy, time_start: time_start, status: status
            })
            if (createdSchedule) {
                resolve({
                    status: "OK", message: "Schedule created successfully.", data: createdSchedule
                })
            }
        } catch (e) {
            reject({
                status: "ERROR", message: "An error occurred while creating the schedule.", error: e
            })
        }
    })
}

const getAllSchedule = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allSchedule = await Schedule.find();
            resolve({
                status: "OK", message: "Schedules retrieved successfully.", data: allSchedule
            })

        } catch (e) {
            reject({
                status: "ERROR", message: "An error occurred while retrieving the schedules.", error: e
            })
        }
    })
}

const updateSchedule = (ScheduleId, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkSchedule = await Schedule.findOne({_id: ScheduleId});
            if (checkSchedule === null) {
                resolve({
                    status: "ERROR", message: "No schedule found with the provided ID."
                })
                return;
            }

            const updatedSchedule = await Schedule.findByIdAndUpdate(ScheduleId, data, {new: true});

            if (!updatedSchedule) {
                resolve({
                    status: "ERROR", message: "Failed to update the schedule or schedule not found."
                });
                return;
            }

            resolve({
                status: "OK", message: "Schedule updated successfully.", data: updatedSchedule
            })

        } catch (e) {
            reject({
                status: "ERROR", message: "An error occurred while updating the schedule.", error: e
            })
        }
    })
}

const getDetailSchedule = (ScheduleId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const schedule = await Schedule.findOne({
                _id: ScheduleId
            })
            if (schedule === null) {
                resolve({
                    status: 'ERROR', message: 'No schedule found with the provided ID.'
                })
                return;
            }
            resolve({
                status: "OK", message: "Schedule details retrieved successfully.", data: schedule
            })

        } catch (e) {
            reject({
                status: "ERROR", message: "An error occurred while retrieving the schedule details.", error: e
            })
        }
    })
}

const deleteSchedule = (ScheduleId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const schedule = await Schedule.findOne({
                _id: ScheduleId
            })
            if (schedule === null) {
                resolve({
                    status: 'ERROR', message: 'No schedule found with the provided ID.'
                })
                return;
            }

            await Schedule.findByIdAndDelete(ScheduleId)
            resolve({
                status: "OK", message: "Schedule deleted successfully.",
            })

        } catch (e) {
            reject({
                status: "ERROR", message: "An error occurred while deleting the schedule.", error: e
            })
        }
    })
}

module.exports = {
    createSchedule, getAllSchedule, updateSchedule, getDetailSchedule, deleteSchedule
}