const Opinion = require("../models/OpinionModel")

const createOpinion = async (customerId, data) => {
    try {
        const opinions = await Opinion.find({}, { id: 1, _id: 0 }).sort({ id: 1 });
        const ids = opinions.map((op) => parseInt(op.id.replace('O', ''), 10));
        let newIdNumber = 1;
        for (const id of ids) {
            if (id === newIdNumber) {
                newIdNumber++;
            } else {
                break;
            }
        }

        const newId = `O${String(newIdNumber).padStart(3, '0')}`;

        const createdOpinion = await Opinion.create({
            id: newId,
            title: data.title,
            content: data.content,
            sender: customerId,
            receive_date: data.receive_date
        });

        if (createdOpinion) {
            return {
                status: "OK",
                message: "Opinion created successfully.",
                data: createdOpinion
            };
        } else {
            return {
                status: "ERROR",
                message: "Failed to create the opinion."
            };
        }
    } catch (e) {
        return {
            status: "ERROR",
            message: "An error occurred while creating the opinion.",
            error: e
        };
    }
};

const getAllOpinion = async () => {
    try {
        const allOpinion = await Opinion.find().populate("sender").populate("receiver");
        return {
            status: "OK",
            message: "Opinions retrieved successfully.",
            data: allOpinion
        };
    } catch (e) {
        return {
            status: "ERROR",
            message: "An error occurred while retrieving the opinions.",
            error: e
        };
    }
};

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

const resolveOpinion = async (managerId, data) => {
    try {
        const updatedOpinion = await Opinion.findByIdAndUpdate(
            data._id,
            {
                feedback: data.feedback,
                receiver: managerId
            },
            { new: true }
        );

        if (!updatedOpinion) {
            return {
                status: 'ERROR',
                message: 'Opinion not found.'
            };
        }

        return {
            status: "OK",
            message: "Opinion resolved successfully.",
            data: updatedOpinion
        };
    } catch (e) {
        return {
            status: "ERROR",
            message: "An error occurred while resolving the opinion.",
            error: e
        };
    }
};

module.exports = {
    createOpinion,
    getAllOpinion,
    getDetailOpinion,
    resolveOpinion
}