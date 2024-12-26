const Account = require("../models/AccountModel")
const Customer = require("../models/CustomerModel")
const Employee = require("../models/EmployeeModel")
const Manager = require("../models/ManagerModel")
const bcrypt = require("bcrypt");
const { generalAccessToken, generalRefreshToken } = require("./jwtService");


const loginAccount = async (data) => {
    try {
        const checkAccount = await Account.findOne({
            user: data.username
        })
        if (!checkAccount){
            return({
                status: "ERROR",
                message: "No account found."
            })
        }

        const type = checkAccount.userType
        let account = null;
        if(type === "Customer"){
            account = await Customer.findOne({
                id_card: data.username
            })
        } else if (type === "Employee"){
            account = await Employee.findOne({
                id_card: data.username
            })
        } else if (type === "Manager"){
            account = await Manager.findOne({
                id_card: data.username
            })
        }
       
        const comparePassword = bcrypt.compareSync(data.password, checkAccount.password)
        if (!comparePassword){
            return({
                status: "ERROR",
                message: "Incorrect password."
            })
        }
        if(checkAccount.status === "Disable"){
            return({
                status: "ERROR",
                message: "Account can not permisstion to login."
            })
        }
  
        const access_token =  await generalAccessToken({
            id: account.id,
        })
        const refresh_token = await generalRefreshToken({
            id: account.id,
        })

        return {
            status: "OK",
            message: "Login successfully.",
            access_token,
            refresh_token,
            status: checkAccount.status,
            userType: checkAccount.userType
        };

    } catch (e) {
        return {
            status: "ERROR",
            message: "An error occurred while creating the bus.",
            error: e
        };
    }
};

const getDetailAccount = async (id) => {    
    try {
        let account = null;
        const userType = id.charAt(0); 
        if (userType === "C") {
            account = await Customer.findOne({ id: id });
        } else if (userType === "E") {
            account = await Employee.findOne({ id: id });
        } else if (userType === "M") {
            account = await Manager.findOne({ id: id });
        } 
        return {
            status: "OK",
            message: "Get detail account successfully.",
            data: account,
        };
    } catch (e) {
        return {
            status: "ERROR",
            message: `Account with id ${id} not found.`,
            error: e
        };
    }
};

module.exports = {
    loginAccount,
    getDetailAccount,
}