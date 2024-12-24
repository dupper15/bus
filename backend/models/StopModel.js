const mongoose = require('mongoose')
const stopSchema = new mongoose.Schema(
    {
        name: {type: String, require: true},
        address: {type: String, require: true},
        pointX: {type: Number, require: true},
        pointY: {type: Number, require: true},
        isStation: {type: Boolean, default: false}
    },
    {
        timestamps: true
    }
);
const Stop = mongoose.model("Stop", stopSchema);
module.exports = Stop;   