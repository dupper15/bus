const Bill = require("../models/MaintenanceBillModel");
const { all } = require("../routes/ManagerRouter");

const createBill = async (data) => {
        try {
            // Lấy tất cả ID hiện có và sắp xếp
            const bills = await Bill.find({}, { id: 1, _id: 0 }).sort({ id: 1 });

            const ids = bills.map((bus) => parseInt(bus.id.replace('M', ''), 10));

            // Tìm ID nhỏ nhất bị thiếu
            let newIdNumber = 1;
            for (const id of ids) {
                if (id === newIdNumber) {
                    newIdNumber++;
                } else {
                    break;
                }
            }
            const newId = `M${String(newIdNumber).padStart(3, '0')}`;

            const createdBill = await Bill.create({
                id: newId,
                bus: data.bus,
                employee: data.employee,
                start_date: data.start_date,
                end_date: data.end_date,
                content: data.content,
                price: data.price
            })
            if (createdBill) {
                resolve({
                    status: "OK",
                    message: "Maintenance bill created successfully.",
                    data: createdBill
                })
            }
        } catch (e) {
            return{
                status: "ERROR",
                message: "An error occurred while creating the maintenance bill.",
                error: e
            };
        }
};

const getAllBill = async () => {
        try {
            const allBill = await Bill.find()
            resolve({
                status: "OK",
                message: "Maintenance bills retrieved successfully.",
                data: allBill
            })

        } catch (e) {
            return({
                status: "ERROR",
                message: "An error occurred while retrieving the maintenance bills.",
                error: e
            })
        }
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