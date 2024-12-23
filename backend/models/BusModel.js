const mongoose = require('mongoose')
const busSchema = new mongoose.Schema(
    {
        id: {type: String, require: true, unique: true},
        type: {type: String, require: true},
        manufacture_year: {type: Number, require: true},
        image: {type: String, require: true},
        count_seat: {type: Number, require: true},
        license_plate: {type: String, require: true, unique: true},
        status: {type: String, default: 'Normal'},
    },
    {
        timestamps: true
    }
);
const Bus = mongoose.model("Bus", busSchema);
module.exports = Bus;   