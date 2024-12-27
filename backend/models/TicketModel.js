const mongoose = require('mongoose')
const ticketSchema = new mongoose.Schema(
    {
        id: {type: String, require: true, unique: true},
        customer: {
            type: mongoose.Schema.ObjectId,
            ref: "Customer",
            require: true
        },
        line: {
            type: mongoose.Schema.ObjectId,
            ref: "Line",
            require: true
        },
        price: {type: Number, require: true},
        effective_date: {type: Date, require: true},
        expiration_date: {type: Date, require: true},
        status: {type: String, default: 'Valid'},
    },
    {
        timestamps: true
    }
);
const Ticket = mongoose.model("Ticket", ticketSchema);
module.exports = Ticket;   