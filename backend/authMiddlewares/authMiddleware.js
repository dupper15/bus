const jwt = require("jsonwebtoken")
const dotenv = require('dotenv')
dotenv.config()

const authMiddleware = (req, res, next) => {
    const token = req.headers.token.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded){
        if (err){
            return res.status(401).json({
                status: 'ERROR',
                message: 'Authentication failed.'
            })
        }
        const { payload } = decoded
        if (payload) {
            next()
        } else {
            return res.status(401).json({
                status: 'ERROR',
                message: 'Authentication failed.'
            })
        }

    })
}

const authCustomerMiddleware = (req, res, next) => {
    const token = req.headers.token//.split(' ')[1]
    const customerId = req.params.id

    if (!token) {
        return res.status(403).json({
            status: 'ERROR',
            message: 'Token is missing.'
        });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, customer){
        if (err){
            return res.status(401).json({
                status: 'ERROR',
                message: 'Authentication failed.'
            })
        }
        const { payload } = customer
        if (payload?.id === customerId) {
            next()
        } else {
            return res.status(403).json({
                status: 'ERROR',
                message: 'Customer ID does not match.'
            })
        }

    })
}

const authEmployeeMiddleware = (req, res, next) => {
    const token = req.headers.token//.split(' ')[1]
    const employeeId = req.params.id

    if (!token) {
        return res.status(403).json({
            status: 'ERROR',
            message: 'Token is missing.'
        });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, employee){
        if (err){
            return res.status(401).json({
                status: 'ERROR',
                message: 'Authentication failed.'
            })
        }
        const { payload } = employee
        if (payload?.id === employeeId) {
            next()
        } else {
            return res.status(403).json({
                status: 'ERROR',
                message: 'Employee ID does not match.'
            })
        }

    })
}

const authManagerMiddleware = (req, res, next) => {
    const token = req.headers.token//.split(' ')[1]
    const managerId = req.params.id

    if (!token) {
        return res.status(403).json({
            status: 'ERROR',
            message: 'Token is missing.'
        });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, manager){
        if (err){
            return res.status(401).json({
                status: 'ERROR',
                message: 'Authentication failed.'
            })
        }
        const { payload } = manager
        if (payload?.id === managerId) {
            next()
        } else {
            return res.status(403).json({
                status: 'ERROR',
                message: 'Manager ID does not match.'
            })
        }

    })
}

module.exports = {
    authMiddleware,
    authCustomerMiddleware,
    authEmployeeMiddleware,
    authManagerMiddleware
}