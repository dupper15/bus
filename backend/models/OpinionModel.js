const mongoose = require('mongoose')
const opinionSchema = new mongoose.Schema(
    {
        id: {type: String, require: true, unique: true},
        title: {type: String, require: true},
        content: {type: String, require:true},
        status: {type: String, default: 'Pending'},
        feedback: {type: String, require: true},
        receive_date: {type: Date, require: true},
        resolve_date: {type: Date, require: true},
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Manager',
            required: true,
        },
    },
    {
        timestamps: true
    }
);
const Opinion = mongoose.model("Opinion", opinionSchema);
module.exports = Opinion;   