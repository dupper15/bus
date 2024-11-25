const mongoose = require('mongoose')
const opinionSchema = new mongoose.Schema(
    {
        title: {type: String, require: true},
        content: {type: String, require:true},
        isResolved: {type: Boolean, default: false, require: true},
        feedback: {
            type: String,
            require: function () { return this.isResolved},
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            require: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Manager',
            require: function () { return this.isResolved}
        },
    },
    {
        timestamps: true
    }
);
const Opinion = mongoose.model("Opinion", opinionSchema);
module.exports = Opinion;   