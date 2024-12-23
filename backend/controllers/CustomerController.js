const CustomerService = require('../services/CustomerService')
const JwtService = require('../services/JwtService')

const createCustomer = async (req, res) => {
    try {
        const data = req.body
        const response = await CustomerService.createCustomer(data)
        return res.status(201).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while creating the customer.'
        })
    }
}

const loginCustomer = async (req, res) => {
    try {
        const { id_card, password } = req.body
        if (!id_card || !password) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'ID card and password are required.'
            })
        }
        const response = await CustomerService.loginCustomer(req.body)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while logging in the customer.'
        })
    }
}

const updateCustomer = async (req, res) => {
    try {
        const customerId = req.params.id
        const data = req.body
        if (!customerId) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Customer ID is required.'
            })
        }
        const response = await CustomerService.updateCustomer(customerId, data)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while updating the customer.'
        })
    }
}

// const updatePasswordCustomer = async (req, res) => {
//     try {
//         const customerId = req.params.id
//         const { password, confirmPassword } = req.body
//         if (!customerId) {
//             return res.status(400).json({
//                 status: 'ERROR',
//                 message: 'Customer ID is required.'
//             })
//         } else if (!password || !confirmPassword) {
//             return res.status(400).json({
//                 status: 'ERROR',
//                 message: 'Password and confirm password are required.'
//             })
//         } else if (password !== confirmPassword) {
//             return res.status(400).json({
//                 status: 'ERROR',
//                 message: 'Password and confirm password do not match.'
//             })
//         }
//         const response = await CustomerService.updatePasswordCustomer(customerId, password)
//         return res.status(200).json(response)
//     } catch (e) {
//         console.error(e)
//         return res.status(500).json({
//             status: 'ERROR',
//             message: 'An error occurred while updating the customer password.'
//         })
//     }
// }

const getAllCustomer = async (req, res) => {
    try {
        const response = await CustomerService.getAllCustomer()
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while retrieving the customers.'
        })
    }
}

const getDetailCustomer = async (req, res) => {
    try {
        const customerId = req.params.id
        if (!customerId) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Customer ID is required.'
            })
        }
        const response = await CustomerService.getDetailCustomer(customerId)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while retrieving the customer details.'
        })
    }
}

const refreshTokenJwtCustomer = async (req, res) => {
    try {
        const token = req.headers.token//.split(' ')[1]
        if (!token) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Token is required.'
            })
        }
        const response = await JwtService.refreshTokenJwtCustomer(token)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while refreshing the token.',
            error: e
        })
    }
}

module.exports = {
    createCustomer,
    loginCustomer,
    updateCustomer,
    getAllCustomer,
    getDetailCustomer,
    refreshTokenJwtCustomer
}