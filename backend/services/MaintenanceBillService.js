const Bill = require("../models/MaintenanceBillModel")

const createBill = (newBill) => {
    return new Promise(async (resolve, reject) => {
        const { bus, employee, start_date, end_date, content, price } = newBill
        try {
            // const checkBill = await Bill.findOne({
            //     bus: bus,
            //     employee: employee,
            // });
            //
            // if (checkBill !== null) {
            //     resolve({
            //         status: "ERROR",
            //         message: "A maintenance bill for this bus and employee already exists."
            //     });
            //     return;
            // }

            const createdBill = await Bill.create({
                bus,
                employee,
                start_date,
                end_date,
                content,
                price
            })
            if (createdBill) {
                resolve({
                    status: "OK",
                    message: "Maintenance bill created successfully.",
                    data: createdBill
                })
            }
        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while creating the maintenance bill.",
                error: e
            })
        }
    })
}

const getAllBill = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allBill = await Bill.find().populate('bus').populate('employee')
            resolve({
                status: "OK",
                message: "Maintenance bills retrieved successfully.",
                data: allBill
            })

        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while retrieving the maintenance bills.",
                error: e
            })
        }
    })
}

const getDetailBill = (BillId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const bill = await Bill.findOne({
                _id: BillId
            })
            if (bill === null) {
                resolve({
                    status: 'ERROR',
                    message: 'No maintenance bill found with the provided ID.'
                })
                return;
            }
            resolve({
                status: "OK",
                message: "Maintenance bill details retrieved successfully.",
                data: bill
            })

        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while retrieving the maintenance bill details.",
                error: e
            })
        }
    })
}

module.exports = {
    createBill,
    getAllBill,
    getDetailBill,
}