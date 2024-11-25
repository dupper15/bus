const jwt = require('jsonwebtoken')
const dotenv = require("dotenv");
dotenv.config()

const generalAccessToken = (payload) => {
    return jwt.sign({
        payload
    }, process.env.ACCESS_TOKEN, {expiresIn: '24h'})
}

const generalRefreshToken = (payload) => {
    return jwt.sign({
        payload
    }, process.env.REFRESH_TOKEN, {expiresIn: '365d'})
}

const refreshTokenJwtCustomer = (token) => {
    return new Promise((resolve, reject) => {
        try {
            jwt.verify(token, process.env.REFRESH_TOKEN, async (err, customer) => {
                if (err){
                    resolve({
                        status: "ERROR",
                        message: "Authentication failed.",
                    })
                    return;
                }
                const {payload} = customer
                const access_token = await generalAccessToken({
                    id: payload?.id
                })
                resolve({
                    status: "OK",
                    message: "Token refreshed successfully.",
                    access_token
                })
            })

        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while refreshing the token.",
                error: e
            })
        }
    })
}

const refreshTokenJwtEmployee = (token) => {
    return new Promise((resolve, reject) => {
        try {
            jwt.verify(token, process.env.REFRESH_TOKEN, async (err, employee) => {
                if (err){
                    resolve({
                        status: "ERROR",
                        message: "Authentication failed.",
                    })
                    return;
                }

                const {payload} = employee
                const access_token = await generalAccessToken({
                    id: payload?.id
                })

                resolve({
                    status: "OK",
                    message: "Token refreshed successfully.",
                    data: access_token
                });
            });
        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while refreshing the token.",
                error: e
            })
        }
    })
}

const refreshTokenJwtManager = (token) => {
    return new Promise((resolve, reject) => {
        try {
            jwt.verify(token, process.env.REFRESH_TOKEN, async (err, manager) => {
                if (err){
                    resolve({
                        status: "ERROR",
                        message: "Authentication failed.",
                    })
                    return;
                }

                const {payload} = manager
                const access_token = await generalAccessToken({
                    id: payload?.id
                })

                resolve({
                    status: "OK",
                    message: "Token refreshed successfully.",
                    data: access_token
                });
            });
        } catch (e) {
            reject({
                status: "ERROR",
                message: "An error occurred while refreshing the token.",
                error: e
            })
        }
    })
}

module.exports = {
    generalAccessToken: generalAccessToken,
    generalRefreshToken: generalRefreshToken,
    refreshTokenJwtCustomer,
    refreshTokenJwtEmployee,
    refreshTokenJwtManager
}