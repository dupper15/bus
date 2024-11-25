const mongoose = require('mongoose')
const managerSchema = new mongoose.Schema(
    {
        name: {type: String, require: true},
        image: {type: String, require: true},
        id_card: {type: String, require: true, unique: true},
        password: {type: String, require: true},
        phone: {type: Number, require: true},
        access_token: {type: String, require: true},
        refresh_token: {type: String, require: true},
    },
    {
        timestamps: true
    }
);
const Manager = mongoose.model("Manager", managerSchema);
module.exports = Manager;   