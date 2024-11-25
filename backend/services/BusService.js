const Bus = require("../models/BusModel")

const createBus = (newBus) => {
    return new Promise(async (resolve, reject) => {
        const { type, manufacture_year, image, count_seat, license_plate } = newBus
        try {
            const checkBus = await Bus.findOne({
                license_plate: license_plate
            })
            if (checkBus !== null){
                resolve({
                    status: "ERROR",
                    message: "A bus with this license plate already exists."
                })
                return;
            }

            const createdBus = await Bus.create({
                type,
                manufacture_year,
                image,
                count_seat,
                license_plate
            })
            if (createdBus){
                resolve({
                    status: "OK",
                    message: "Bus created successfully.",
                    data: createdBus
                })
            }
        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while creating the bus.",
                error: e
            })
        }
    })
}

const updateBus = (BusId, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkBus = await Bus.findOne({ _id: BusId });
            if (checkBus === null){
                resolve({
                    status: "ERROR",
                    message: "No bus found with the provided ID."
                })
                return;
            }

            const updatedBus = await Bus.findByIdAndUpdate(BusId, data, { new: true });

            if (!updatedBus) {
                resolve({
                    status: "ERROR",
                    message: "Failed to update the bus or bus not found."
                });
                return;
            }

            resolve({
                status: "OK",
                message: "Bus updated successfully.",
                data: updatedBus
            })

        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while updating the bus.",
                error: e
            })
        }
    })
}

const getAllBus = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allBus = await Bus.find();
            resolve({
                status: "OK",
                message: "Buses retrieved successfully.",
                data: allBus
            })

        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while retrieving the buses.",
                error: e
            })
        }
    })
}

const getDetailBus = (BusId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const bus = await Bus.findOne({
                _id: BusId
            })
            if (bus === null){
                resolve({
                    status: 'ERROR',
                    message: 'No bus found with the provided ID.'
                })
                return;
            }
            resolve({
                status: "OK",
                message: "Bus details retrieved successfully.",
                data: bus
            })

        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while retrieving the bus details.",
                error: e
            })
        }
    })
}

const deleteBus = (busId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const bus = await Bus.findOne({
                _id: busId
            })
            if (bus === null){
                resolve({
                    status: 'ERROR',
                    message: 'No bus found with the provided ID.'
                })
                return;
            }

            await Bus.findByIdAndDelete(busId)
            resolve({
                status: "OK",
                message: "Bus deleted successfully.",
            })

        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while deleting the bus.",
                error: e
            })
        }
    })
}

module.exports = {
    createBus,
    updateBus,
    getAllBus,
    getDetailBus,
    deleteBus
}