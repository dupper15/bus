const mongoose = require('mongoose')
const employeeSchema = new mongoose.Schema({
    name: {type: String, require: true},
    image: {type: String, require: true},
    id_card: {type: String, require: true, unique: true},
    password: {type: String, require: true},
    phone: {type: Number, require: true},
    salary: {type: Number, require: true},
    isDriver: {type: Boolean, default: false},
    license: {
        type: String,
        // require: function () {
        //     return this.isDriver;
        // },
        //unique: true
    },
    access_token: {type: String, require: true},
    refresh_token: {type: String, require: true},
}, {
    timestamps: true
});
const Employee = mongoose.model("Employee", employeeSchema);
module.exports = Employee;   