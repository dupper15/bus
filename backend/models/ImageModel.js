const mongoose = require('mongoose')
const imageSchema = new mongoose.Schema(
    {
        type: {type: String, require: true},
        manufacture_year: {type: Number, require: true},
        image: {type: String, require: true},
        count_seat: {type: Number, require: true},
        license_plate: {type: String, require: true, unique: true},
    },
    {
        timestamps: true
    }
);
const Image = mongoose.model("Image", imageSchema);
module.exports = Image;   