const mongoose = require('mongoose')
const lineSchema = new mongoose.Schema(
    {
        name: {type: String, require: true},
        start_place: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Stop",
            require: true
        },
        end_place: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Stop",
            require: true
        },
        time: {type: Number, require: true},
        arr_stop: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Stop",
                require: true
            }
        ]
    },
    {
        timestamps: true
    }
);
const Line = mongoose.model("Line", lineSchema);
module.exports = Line;   