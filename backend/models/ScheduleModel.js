const mongoose = require('mongoose')
const scheduleSchema = new mongoose.Schema({
    bus: {
        type: mongoose.Schema.ObjectId,
        ref: "Bus",
        require: true
    },
    line: {
        type: mongoose.Schema.ObjectId,
        ref: "Line",
        require: true
    },
    driver: {
        type: mongoose.Schema.ObjectId,
        ref: "Employee",
        require: true
    },
    busboy: {
        type: mongoose.Schema.ObjectId,
        ref: "Employee",
        require: true
    },
    time_start: {type: Number, require: true},
    status: {type: String, default: "Pending", require: true}
}, {
    timestamps: true
});
const Schedule = mongoose.model("Schedule", scheduleSchema);
module.exports = Schedule;   