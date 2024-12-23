const Line = require("../models/LineModel")

const createLine = (newLine) => {
    return new Promise(async (resolve, reject) => {
        const {name, start_place, end_place, time, arr_stop} = newLine
        try {

            // Need to implement checking for existing line with the same routes
            // const checkLine = await Line.findOne({
            //
            // })
            // if (checkLine !== null) {
            //     resolve({
            //         status: "ERROR", message: "A line with this route already exists."
            //     })
            //     return;
            // }

            const createdLine = await Line.create({
                name,
                start_place,
                end_place,
                time,
                arr_stop
            })
            if (createdLine) {
                resolve({
                    status: "OK", message: "Line created successfully.", data: createdLine
                })
            }
        } catch (e) {
            reject({
                status: "ERROR", message: "An error occurred while creating the line.", error: e
            })
        }
    })
}

const updateLine = (LineId, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const checkLine = await Line.findOne({_id: LineId});
            if (checkLine === null) {
                resolve({
                    status: "ERROR", message: "No line found with the provided ID."
                })
                return;
            }

            const updatedLine = await Line.findByIdAndUpdate(LineId, data, {new: true});

            if (!updatedLine) {
                resolve({
                    status: "ERROR", message: "Failed to update the line or line not found."
                });
                return;
            }

            resolve({
                status: "OK", message: "Line updated successfully.", data: updatedLine
            })

        } catch (e) {
            reject({
                status: "ERROR", message: "An error occurred while updating the line.", error: e
            })
        }
    })
}

const getAllLine = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allLine = await Line.find().populate('start_place').populate('end_place').populate('arr_stop');
            resolve({
                status: "OK", message: "Lines retrieved successfully.", data: allLine
            });
        } catch (e) {
            reject({
                status: "ERROR", message: "An error occurred while retrieving the lines.", error: e
            });
        }
    });
}

const getDetailLine = (LineId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const line = await Line.findOne({ _id: LineId }).populate('start_place').populate('end_place').populate('arr_stop');
            if (line === null) {
                resolve({
                    status: 'ERROR', message: 'No line found with the provided ID.'
                });
                return;
            }
            resolve({
                status: "OK", message: "Line details retrieved successfully.", data: line
            });
        } catch (e) {
            reject({
                status: "ERROR", message: "An error occurred while retrieving the line details.", error: e
            });
        }
    });
}

const deleteLine = (LineId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const line = await Line.findOne({
                _id: LineId
            })
            if (line === null) {
                resolve({
                    status: 'ERROR', message: 'No line found with the provided ID.'
                })
                return;
            }

            await Line.findByIdAndDelete(LineId)
            resolve({
                status: "OK", message: "Line deleted successfully.",
            })

        } catch (e) {
            reject({
                status: "ERROR", message: "An error occurred while deleting the line.", error: e
            })
        }
    })
}

module.exports = {
    createLine, updateLine, getAllLine, getDetailLine, deleteLine
}