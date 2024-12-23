const mongoose = require('mongoose')
const customerSchema = new mongoose.Schema(
    {
        id: {type: String, require: true, unique: true},
        name: {type: String, require: true},
        image: {type: String, require: true},
        id_card: {type: String, require: true, unique: true},
        username: {type: String, require: true},
        password: {type: String, require: true},
        phone: {type: Number, require: true},
        status: {type: String, default: 'Enable'},
        access_token: {type: String, require: true},
        refresh_token: {type: String, require: true},
    },
    {
        timestamps: true    
    }
);
const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;   