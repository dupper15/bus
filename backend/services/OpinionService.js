const Opinion = require("../models/OpinionModel")
const Manager = require("../models/ManagerModel")

const createOpinion = async (data) => {
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
            sender: data._id,
            receive_date: new Date() 
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
        const allOpinion = await Opinion.find().populate("sender").populate("receiver", "name");
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
const getAllCustomer = async (id) => {
    try {
        const allOpinion = await Opinion.find({sender: id}).populate("sender", "name").populate("receiver", "name");
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

const getAllStatus = async () => {
    try {
        const count_pending = await Opinion.countDocuments({status: "Pending"});
        const count_resolved = await Opinion.countDocuments({status: "Resolved"});
        const opinionPending = await Opinion.find({status: "Pending"}).populate("sender").populate("receiver");
        const opinionResolved = await Opinion.find({status: "Resolved"}).populate("sender").populate("receiver");

        return {
            status: "OK",
            message: "Opinions retrieved successfully.",
            data: {
                pending: count_pending,
                resolved: count_resolved,
                opinionPending: opinionPending,
                opinionResolved: opinionResolved
            }
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

const resolveOpinion = async (data) => {
    try {
        const manager = await Manager.findById(data.manager);
        
        updatedOpinion = await Opinion.findByIdAndUpdate(
            data._id,
            {
                status: "Resolved",
                receiver: manager._id,
                feedback: data.feedback,
                resolve_date: new Date()
            },
            { new: true }
        );
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
    getAllStatus,
    getDetailOpinion,
    resolveOpinion,
    getAllCustomer
}