const mongoose = require('mongoose')
const employeeSchema = new mongoose.Schema({
    id: {type: String, require: true, unique: true},
    name: {type: String, require: true},
    gender: {type: String, require: true},
    position: {type: String, require: true},
    phone: {type: String, require: true},
    id_card: {type: String, require: true},
    image: {type: String, require: true},
    username: {type: String, require: true}, 
    password: {type: String, require: true},
    salary: {type: Number, require: true},
    hire_date: {type: Date, require: true},
    license: {type: String, default: null},
    status: {type: String, default: 'Enable'},
    access_token: {type: String, require: true},
    refresh_token: {type: String, require: true},
}, {
    timestamps: true
});
const Employee = mongoose.model("Employee", employeeSchema);
module.exports = Employee;   