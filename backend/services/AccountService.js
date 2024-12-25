const Account = require("../models/AccountModel")
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
       
        const comparePassword = bcrypt.compareSync(data.password, checkAccount.password)
        console.log("comparePassword", comparePassword)
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
            id: checkAccount.id,
        })
        const refresh_token = await generalRefreshToken({
            id: checkAccount.id,
        })

        return {
            status: "OK",
            message: "Login successfully.",
            data: {
                access_token,
                refresh_token,
                status: checkAccount.status,
                userType: checkAccount.userType
            }
        };

    } catch (e) {
        return {
            status: "ERROR",
            message: "An error occurred while creating the bus.",
            error: e
        };
    }
};

const logoutAccount = async (data) => {
    try {
        // Kiểm tra xe buýt với biển số đã tồn tại
        const checkBus = await Bus.findOne({ license_plate: data.license_plate });
        if (!checkBus) {
            return {
                status: "ERROR",
                message: "No bus found with the provided license plate."
            };
        }

        // Cập nhật thông tin xe buýt
        const updatedBus = await Bus.findByIdAndUpdate(checkBus._id, data, { new: true });
        if (!updatedBus) {
            return {
                status: "ERROR",
                message: "Failed to update the bus or bus not found."
            };
        }

        return {
            status: "OK",
            message: "Bus updated successfully.",
            data: updatedBus
        };

    } catch (e) {
        return {
            status: "ERROR",
            message: "An error occurred while updating the bus.",
            error: e
        };
    }
};

module.exports = {
    loginAccount,
    logoutAccount,
}