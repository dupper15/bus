const Line = require("../models/LineModel");
const Ticket = require("../models/TicketModel");

const createTicket = async (data) => {
    try {
        const tickets = await Ticket.find({}, { id: 1, _id: 0 }).sort({ id: 1 });

        const ids = tickets.map((ticket) => parseInt(ticket.id.replace('T', ''), 10));

        let newIdNumber = 1;
        for (const id of ids) {
            if (id === newIdNumber) {
                newIdNumber++;
            } else {
                break;
            }
        }
        const newId = `T${String(newIdNumber).padStart(3, '0')}`;

        const lineId = await Line.findOne({name: data.line})

        // Tính toán expiration_date dựa trên effective_date
        const effectiveDate = data.effective_date
            ? new Date(data.effective_date)
            : new Date(); // Nếu không có ngày hiệu lực, sử dụng ngày hiện tại
            
        if (isNaN(effectiveDate)) {
            throw new Error("Invalid effective_date format.");
        }

        const expirationDate = new Date(effectiveDate.getTime() + 30 * 24 * 60 * 60 * 1000); // Cộng 30 ngày

        const createdTicket = await Ticket.create({
            id: newId,
            customer: data.customer,
            line: lineId,
            price: data.price,
            effective_date: effectiveDate,
            expiration_date: expirationDate,
        });

        return {
            status: "OK",
            message: "Buy ticket successfully.",
            data: createdTicket,
        };
    } catch (e) {
        throw {
            status: "ERROR",
            message: "An error occurred while creating the ticket.",
            error: e,
        };
    }
};

const getAllTicket = async (data) => {
    try {
        const currentDate = new Date();

        await Ticket.updateMany(
            { expiration_date: { $lte: currentDate } }, // Điều kiện: hết hạn hoặc bằng ngày hiện tại
            { $set: { status: "Expired" } }            // Cập nhật status thành "Expired"
        );

        const tickets = await Ticket.find().populate('customer');

        return {
            status: "OK",
            message: "Tickets retrieved successfully.",
            data: tickets ,
        };
    } catch (e) {
        throw {
            status: "ERROR",
            message: "An error occurred while creating the ticket.",
            error: e,
        };
    }
};

const getDetailTicket = async (customerId) => {
    try {
        const currentDate = new Date();

        await Ticket.updateMany(
            { expiration_date: { $lte: currentDate } }, // Điều kiện: hết hạn hoặc bằng ngày hiện tại
            { $set: { status: "Expired" } }            // Cập nhật status thành "Expired"
        );

        const tickets = await Ticket.find({customer: customerId}).populate('customer', 'name');

        return {
            status: "OK",
            message: "Tickets retrieved successfully.",
            data: tickets ,
        };
    } catch (e) {
        throw {
            status: "ERROR",
            message: "An error occurred while creating the ticket.",
            error: e,
        };
    }
};

module.exports = {
    createTicket,
    getAllTicket,
    getDetailTicket
};
