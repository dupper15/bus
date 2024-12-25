const AccountService = require('../services/AccountService') 

const loginAccount = async (req, res) => {
    try {
        const data = req.body;
        const response = await AccountService.loginAccount(data)
        const { refresh_token, ...newResponse } = response;
            res.cookie("refresh_token", refresh_token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
        });
        return res.status(201).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while creating the bus.'
        })
    }
}

const logoutAccount = async (req, res) => {
    try {
        const response = await AccountService.logoutAccount(data)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while updating the bus.'
        })
    }
}

module.exports = {
    loginAccount,
    logoutAccount,
}