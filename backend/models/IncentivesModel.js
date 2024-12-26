const mongoose = require('mongoose')
const incentivesSchema = new mongoose.Schema({
    id: {type: String, require: true, unique: true},
    employee: {
        type: mongoose.Schema.ObjectId,
        ref: "Employee",
        require: true
    },
    content: {type: String, require: true},
    type: {type: String, require: true},
    date : {type: Date, require: true},
    price: {type: String, require: true}
}, {
    timestamps: true
});
const Incentives = mongoose.model("Incentives", incentivesSchema);
module.exports = Incentives;   