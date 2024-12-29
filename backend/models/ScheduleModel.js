const mongoose = require('mongoose')
const scheduleSchema = new mongoose.Schema({
    id: {type: String, require: true, unique: true},
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
    time_start: {type: String, require: true},
    time: {type: Number, require: true},    
    status: {type: String, default: "Pending", require: true},
    ticket3: {type: Number, require: true, default: 0},
    ticket7: {type: Number, require: true, default: 0},
    date: {type: Date, require: true, default: Date.now}
}, {
    timestamps: true
});
const Schedule = mongoose.model("Schedule", scheduleSchema);
module.exports = Schedule;   