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
        start_date: {type: Date, require: true},
        end_date: {type: Date, require: true},
        content: {type: String, require: true},
        price: {type: Number, require: true}
    },
    {
        timestamps: true
    }
);
const Bill = mongoose.model("Bill", billSchema);
module.exports = Bill;   