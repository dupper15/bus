const Employee = require("../models/EmployeeModel");
const Incentives = require("../models/IncentivesModel")

const createIncentives = async (data) => {
    try {
        const checkEmployee = await Employee.findOne({id: data.id})
        if (!checkEmployee) {
            return {
                status: "ERROR",
                message: "ID employee not found."
            };
        }
        const incentives = await Incentives.find({}, { id: 1, _id: 0 }).sort({ id: 1 });
        const ids = incentives.map((item) => parseInt(item.id.replace('I', ''), 10));

        let newIdNumber = 1;
        for (const id of ids) {
            if (id === newIdNumber) {
                newIdNumber++;
            } else {
                break;
            }
        }
        const newId = `I${String(newIdNumber).padStart(3, '0')}`;

        const createdIncentives = await Incentives.create({
            id: newId,
            employee: checkEmployee._id,
            content: data.content,
            type: data.type,
            date: data.date,
            price: data.price
        });

        if (createdIncentives) {
            return {
                status: "OK",
                message: "Incentives created successfully.",
                data: createdIncentives
            };
        } else {
            return {
                status: "ERROR",
                message: "Failed to create Incentives."
            };
        }
    } catch (error) {
        return {
            status: "ERROR",
            message: "An error occurred while creating the Incentives.",
            error: error.message || error
        };
    }
};

const getAllIncentives = async () => {
    try {
        const allIncentives = await Incentives.find().populate('employee');
        return {
            status: "OK",
            message: "Incentives retrieved successfully.",
            data: allIncentives
        };
    } catch (error) {
        return {
            status: "ERROR",
            message: "An error occurred while retrieving the Incentives.",
            error: error.message || error
        };
    }
};

const updateIncentives = async (data) => {
    try {
        const checkIncentives = await Incentives.findOne({ id: data.id });
        if (!checkIncentives) {
            return {
                status: "ERROR",
                message: "No Incentives found with the provided ID."
            };
        }
        const updatedIncentives = await Incentives.findByIdAndUpdate(
            checkIncentives._id,
            data,
            { new: true }
        );
        if (!updatedIncentives) {
            return {
                status: "ERROR",
                message: "Failed to update the Incentives or Incentives not found."
            };
        }
        return {
            status: "OK",
            message: "Incentives updated successfully.",
            data: updatedIncentives
        };
    } catch (error) {
        return {
            status: "ERROR",
            message: "An error occurred while updating the Incentives.",
            error: error.message || error
        };
    }
};

const getDetailIncentives = (IncentivesId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const Incentives = await Incentives.findOne({
                _id: IncentivesId
            })
            if (Incentives === null) {
                resolve({
                    status: 'ERROR', message: 'No Incentives found with the provided ID.'
                })
                return;
            }
            resolve({
                status: "OK", message: "Incentives details retrieved successfully.", data: Incentives
            })

        } catch (e) {
            reject({
                status: "ERROR", message: "An error occurred while retrieving the Incentives details.", error: e
            })
        }
    })
}

const deleteIncentives = async (data) => {
    try {
        await Incentives.findByIdAndDelete(data._id);
        return {
            status: "OK",
            message: "Incentives deleted successfully."
        };
    } catch (error) {
        return {
            status: "ERROR",
            message: "An error occurred while deleting the Incentives.",
            error: error.message || error
        };
    }
};

module.exports = {
    createIncentives, 
    getAllIncentives, 
    updateIncentives, 
    getDetailIncentives, 
    deleteIncentives
}