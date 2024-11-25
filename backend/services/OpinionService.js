const Opinion = require("../models/OpinionModel")

const createOpinion = (newOpinion) => {
    return new Promise(async (resolve, reject) => {
        const { title, content, sender } = newOpinion
        try {
            const createdOpinion = await Opinion.create({
                title,
                content,
                sender
            })
            if (createdOpinion){
                resolve({
                    status: "OK",
                    message: "Opinion created successfully.",
                    data: createdOpinion
                })
            }
        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while creating the opinion.",
                error: e
            })
        }
    })
}

const getAllOpinion = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allOpinion = await Opinion.find();
            resolve({
                status: "OK",
                message: "Opinions retrieved successfully.",
                data: allOpinion
            })

        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while retrieving the opinions.",
                error: e
            })
        }
    })
}

const getDetailOpinion = (OpinionId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const opinion = await Opinion.findOne({
                _id: OpinionId
            })
            if (opinion === null){
                resolve({
                    status: 'ERROR',
                    message: 'No opinion found with the provided ID.'
                })
                return;
            }
            resolve({
                status: "OK",
                message: "Opinion details retrieved successfully.",
                data: opinion
            })

        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while retrieving the opinion details.",
                error: e
            })
        }
    })
}

const resolveOpinion = (opinionId, updateData) => {
    return new Promise(async (resolve, reject) => {
        try {
            const updatedOpinion = await Opinion.findByIdAndUpdate(
                opinionId,
                {
                    isResolved: true,
                    feedback: updateData.feedback,
                    receiver: updateData.receiver
                },
                { new: true }
            );
            if (!updatedOpinion){
                resolve({
                    status: 'ERROR',
                    message: 'Opinion not found.'
                })
                return;
            }
            resolve({
                status: "OK",
                message: "Opinion resolved successfully.",
                data: updatedOpinion
            })

        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while resolving the opinion.",
                error: e
            })
        }
    })
}

module.exports = {
    createOpinion,
    getAllOpinion,
    getDetailOpinion,
    resolveOpinion
}