const mongoose = require('mongoose')
const dayOffSchema = new mongoose.Schema({
    id: {type: String, require: true, unique: true},
    employee: {
        type: mongoose.Schema.ObjectId,
        ref: "Employee",
        require: true
    },
    manager: {
        type: mongoose.Schema.ObjectId,
        ref: "Manager",
        require: true
    },
    title: {type: String, require: true},
    content: {type: String, require: true},
    feedback: {type: String, require: true},
    status: {type: String, default: "Pending", require: true},
    date_requested : {type: Date, require: true},
    date_resolved : {type: Date, require: true}
}, {
    timestamps: true
});
const DayOff = mongoose.model("DayOff", dayOffSchema);
module.exports = DayOff;   