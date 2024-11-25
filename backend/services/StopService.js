const Stop = require("../models/StopModel")

const createStop = (newStop) => {
    return new Promise(async (resolve, reject) => {
        const { name, address, pointX, pointY, isStation } = newStop
        try {
            const checkStop = await Stop.findOne({
                name: name,
                address: address,
                pointX: pointX,
                pointY: pointY
            })
            if (checkStop !== null){
                resolve({
                    status: "ERROR",
                    message: "A stop with this address already exists."
                })
                return;
            }

            const createdStop = await Stop.create({
                name,
                address,
                pointX,
                pointY,
                isStation
            })
            if (createdStop){
                resolve({
                    status: "OK",
                    message: "Stop created successfully.",
                    data: createdStop
                })
            }
        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while creating the stop.",
                error: e
            })
        }
    })
}

const getAllStop = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allStop = await Stop.find();
            resolve({
                status: "OK",
                message: "Stops retrieved successfully.",
                data: allStop
            })

        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while retrieving the stops.",
                error: e
            })
        }
    })
}

const updateStop = (StopId, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkStop = await Stop.findOne({ _id: StopId });
            if (checkStop === null){
                resolve({
                    status: "ERROR",
                    message: "No stop found with the provided ID."
                })
                return;
            }

            const updatedStop = await Stop.findByIdAndUpdate(StopId, data, { new: true });

            if (!updatedStop) {
                resolve({
                    status: "ERROR",
                    message: "Failed to update the stop or stop not found."
                });
                return;
            }

            resolve({
                status: "OK",
                message: "Stop updated successfully.",
                data: updatedStop
            })

        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while updating the stop.",
                error: e
            })
        }
    })
}

const getDetailStop = (StopId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const stop = await Stop.findOne({
                _id: StopId
            })
            if (stop === null){
                resolve({
                    status: 'ERROR',
                    message: 'No stop found with the provided ID.'
                })
                return;
            }
            resolve({
                status: "OK",
                message: "Stop details retrieved successfully.",
                data: stop
            })

        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while retrieving the stop details.",
                error: e
            })
        }
    })
}

const deleteStop = (StopId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const stop = await Stop.findOne({
                _id: StopId
            })
            if (stop === null){
                resolve({
                    status: 'ERROR',
                    message: 'No stop found with the provided ID.'
                })
                return;
            }

            await Stop.findByIdAndDelete(StopId)
            resolve({
                status: "OK",
                message: "Stop deleted successfully.",
            })

        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while deleting the stop.",
                error: e
            })
        }
    })
}

module.exports = {
    createStop,
    getAllStop,
    updateStop,
    getDetailStop,
    deleteStop
}