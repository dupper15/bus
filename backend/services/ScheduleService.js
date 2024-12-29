const Bus = require("../models/BusModel")
const Employee = require("../models/EmployeeModel")
const Line = require("../models/LineModel")
const Schedule = require("../models/ScheduleModel")

const createSchedule = async (data) => {
        try {
            // const checkSchedule = await Schedule.findOne({
                
            // })
            // if (checkSchedule !== null) {
            //     resolve({
            //         status: "ERROR", message: "A schedule with this information already exists."
            //     })
            //     return;
            // }
            // Lấy tất cả ID hiện có và sắp xếp
            const schedules = await Schedule.find({}, { id: 1, _id: 0 }).sort({ id: 1 });

            const ids = schedules.map((schedule) => parseInt(schedule.id.replace('S', ''), 10));

            // Tìm ID nhỏ nhất bị thiếu
            let newIdNumber = 1;
            for (const id of ids) {
                if (id === newIdNumber) {
                    newIdNumber++;
                } else {
                    break;
                }
            }
            const newId = `S${String(newIdNumber).padStart(3, '0')}`;

            const createdSchedule = await Schedule.create({
                id: newId,
                bus: data.bus, 
                line: data.line, 
                driver: data.driver, 
                busboy: data.busboy, 
                time_start: data.time_start,
                time: data.time, 
            })
            if (createdSchedule) {
                return({
                    status: "OK", 
                    message: "Schedule created successfully.", 
                    data: createdSchedule
                })
            }
        } catch (e) {
            return({
                status: "ERROR", 
                message: "An error occurred while creating the schedule.", 
                error: e
            })
        }
}

const getAllSchedule = async () => {
        try {
            const allSchedule = await Schedule.find()
            .populate("bus", "_id id license_plate status")
            .populate("line", "_id id name")
            .populate("driver", "_id id name status")
            .populate("busboy", "_id id name status");
            return({
                status: "OK", 
                message: "Schedules retrieved successfully.", 
                data: allSchedule
            })
        } catch (e) {
            return({
                status: "ERROR", 
                message: "An error occurred while retrieving the schedules.", 
                error: e
            })
        }
}

const getAllAdd = async () => {
    try {
        const bus = await Bus.find({status: "Active"}).select('_id id license_plate');
        const line = await Line.find().select('_id id name');
        const driver = await Employee.find({position: "Driver", status: "Enable"}).select('_id id name');
        const busboy = await Employee.find({position: "Bus boy", status: "Enable"}).select('_id id name');
        return({
            status: "OK", 
            message: "Schedules retrieved successfully.", 
            data: {
                bus: bus,
                line: line,
                driver: driver,
                busboy: busboy
            }
        })
    } catch (e) {
        return({
            status: "ERROR", 
            message: "An error occurred while retrieving the schedules.", 
            error: e
        })
    }
}

const updateSchedule = async (data) => {
        try {
            console.log("data",data);
            const checkSchedule = await Schedule.findOne({_id: data._id});
            if (!checkSchedule) {
                return({
                    status: "ERROR", 
                    message: "No schedule found with the provided ID."
                })
            }

            const updatedSchedule = await Schedule.findByIdAndUpdate(
                data._id, 
                data, 
                {new: true}
            );

            if (!updatedSchedule) {
                return({
                    status: "ERROR", 
                    message: "Failed to update the schedule or schedule not found."
                });
            }
            return({
                status: "OK", 
                message: "Schedule updated successfully.", 
                data: updatedSchedule
            })

        } catch (e) {
            return({
                status: "ERROR", 
                message: "An error occurred while updating the schedule.", 
                error: e
            })
        }
}

const getDetailSchedule = (ScheduleId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const schedule = await Schedule.findOne({
                _id: ScheduleId
            })
            if (schedule === null) {
                resolve({
                    status: 'ERROR', 
                    message: 'No schedule found with the provided ID.'
                })
                return;
            }
            resolve({
                status: "OK", 
                message: "Schedule details retrieved successfully.", 
                data: schedule
            })

        } catch (e) {
            reject({
                status: "ERROR", 
                message: "An error occurred while retrieving the schedule details.", 
                error: e
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
    createSchedule, getAllSchedule, updateSchedule, getDetailSchedule, deleteSchedule, getAllAdd
}