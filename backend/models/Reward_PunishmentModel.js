const mongoose = require('mongoose')
const reward_punishmentSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.ObjectId,
        ref: "Employee",
        require: true
    },
    content: {type: String, require: true},
    type: {type: String, require: true},
    date : {type: Number, require: true}
}, {
    timestamps: true
});
const Reward_Punishment = mongoose.model("Reward_Punishment", reward_punishmentSchema);
module.exports = Reward_Punishment;   