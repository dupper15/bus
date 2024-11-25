const mongoose = require('mongoose')
const dayOffSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.ObjectId,
        ref: "Employee",
        require: true
    },
    solver: {
        type: mongoose.Schema.ObjectId,
        ref: "Manager",
        require: true
    },
    content: {type: String, require: true},
    status: {type: String, default: "Pending", require: true},
    date_requested : {type: Number, require: true}
}, {
    timestamps: true
});
const DayOff = mongoose.model("DayOff", dayOffSchema);
module.exports = DayOff;   