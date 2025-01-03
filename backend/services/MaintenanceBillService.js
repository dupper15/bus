const Bill = require("../models/MaintenanceBillModel");
const Bus = require("../models/BusModel");

const createBill = async (data) => {
        try {
            // Lấy tất cả ID hiện có và sắp xếp
            const bills = await Bill.find({}, { id: 1, _id: 0 }).sort({ id: 1 });

            const ids = bills.map((bill) => parseInt(bill.id.replace('M', ''), 10));

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

            const bus = await Bus.findOne({license_plate: data.license_plate})

            if (bus) {
                bus.status = "Maintenance"; 
                await bus.save();           
            } else {
                return({
                    status: "ERROR",
                    message: `Bus not found with license plate: ${data.license_plate}`
                })
            }

            const createdBill = await Bill.create({
                id: newId,
                bus: bus._id,
                employee: data.employee,
                start_date: data.start_date,
                end_date: data.end_date,
                image: data.image,
                title: data.title,
                content: data.content,
                price: data.price,
            })
            if (createdBill) {
                return({
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
            const allBill = await Bill.find().populate("bus", "license_plate")
            return({
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

const getDetailBill = async (employeeId) => {
    try {
        console.log(employeeId);
        const bill = await Bill.find({
            employee: employeeId
        }).populate("bus", "license_plate");
        console.log(bill);
        if (bill === null) {
            return {
                status: "OK",
                message: "Maintenance bill not found.",
                data: []
            };
        }
        return {
            status: "OK",
            message: "Maintenance bill details retrieved successfully.",
            data: bill
        };
    } catch (e) {
        return {
            status: "ERROR",
            message: "An error occurred while retrieving the maintenance bill details.",
            error: e
        };
    }
};

const editBill = async (data) => {
    try {
        const bill = await Bill.findOne({id: data.id});
        bill.status = data.status;
        bill.save();

        if (bill) {
            return({
                status: "OK",
                message: "Maintenance bill change status successfully.",
                data: bill
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


module.exports = {
    createBill,
    getAllBill,
    getDetailBill,
    editBill
}