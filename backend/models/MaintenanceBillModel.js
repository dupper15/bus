const mongoose = require('mongoose')
const billSchema = new mongoose.Schema(
    {
        id: {type: String, require: true, unique: true},
        bus: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Bus",
            require: true
        },
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            require: true
        },
        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Manager",
            require: true
        },
        image: {type: String, require: true},
        start_date: {type: Date, require: true},
        end_date: {type: Date, require: true},
        title: {type: String, require: true},
        content: {type: String, require: true},
        price: {type: String, require: true},
        status: {type: String, default: "Pending", require: true}
    },
    {
        timestamps: true
    }
);
const Bill = mongoose.model("Bill", billSchema);
module.exports = Bill;   