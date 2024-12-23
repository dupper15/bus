const mongoose = require('mongoose')
const accountSchema = new mongoose.Schema(
    {
        user: { type: String},
        userType: {
            type: String,
            required: true,
            enum: ['Employee', 'Customer'] // Chỉ được phép là 'Employee' hoặc 'Customer'
        },
        username: {type: String, require: true},
        password: {type: String, require: true},
        status: {type: String, default: 'Enable'},
        access_token: {type: String, require: true},
        refresh_token: {type: String, require: true},
    },
    {
        timestamps: true    
    }
);
const Account = mongoose.model("Account", accountSchema);
module.exports = Account;   