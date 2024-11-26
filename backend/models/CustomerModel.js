const mongoose = require('mongoose')
const customerSchema = new mongoose.Schema(
    {
        name: {type: String, require: true},
        image: {type: String, default: 'https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png'},
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
const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;   