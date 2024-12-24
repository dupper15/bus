const mongoose = require('mongoose')
const busSchema = new mongoose.Schema(
    {
        id: {type: String, require: true, unique: true},
        type: {type: String, require: true},
        manufacture_year: {type: String, require: true},
        image: {type: String, require: true},
        count_seat: {type: String, require: true},
        license_plate: {type: String, require: true, unique: true},
        status: {type: String, default: 'Active'},
    },
    {
        timestamps: true
    }
);
const Bus = mongoose.model("Bus", busSchema);
module.exports = Bus;   