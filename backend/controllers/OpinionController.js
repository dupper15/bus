const OpinionService = require('../services/OpinionService')

const createOpinion =  async (req, res) => {
    try {
        const data = req.body
        const response = await OpinionService.createOpinion(data)
        return res.status(201).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while creating the opinion.',
            error: e
        })
    }
}

const getAllOpinion =  async (req, res) => {
    try {
        const response = await OpinionService.getAllOpinion()
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while retrieving the opinions.',
            error: e
        })
    }
}

const getAllCustomer =  async (req, res) => {
    try {
        const customerId = req.params.id;
        const response = await OpinionService.getAllCustomer(customerId)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while retrieving the opinions.',
            error: e
        })
    }
}

const getAllStatus =  async (req, res) => {
    try {
        const response = await OpinionService.getAllStatus()
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while retrieving the opinions.',
            error: e
        })
    }
}

const getDetailOpinion =  async (req, res) => {
    try {
        if (!opinionId){
            return res.status(400).json({
                status: 'ERROR',
                message: 'Opinion ID is required.'
            })
        }
        const response = await OpinionService.getDetailOpinion(opinionId)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while retrieving the opinion details.',
            error: e
        })
    }
}

const resolveOpinion =  async (req, res) => {
    try {
        const data = req.body 
        const response = await OpinionService.resolveOpinion(data)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while resolving the opinion.',
            error: e
        })
    }
}

module.exports = {
    createOpinion,
    getAllOpinion,
    getDetailOpinion,
    resolveOpinion,
    getAllStatus,
    getAllCustomer
}