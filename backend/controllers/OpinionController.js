const OpinionService = require('../services/OpinionService')

const createOpinion =  async (req, res) => {
    try {
        const { title, content, sender} = req.body
        if (!title || !content || !sender) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'All fields are required.'
            })
        }

        const response = await OpinionService.createOpinion(req.body)
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

const getDetailOpinion =  async (req, res) => {
    try {
        const opinionId = req.params.id
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
        const opinionId = req.params.id
        const {feedback, receiver} = req.body
        if (!opinionId){
            return res.status(400).json({
                status: 'ERROR',
                message: 'Opinion ID is required.'
            })
        }
        if (!feedback || !receiver) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Feedback and receiver are required.'
            });
        }

        const response = await OpinionService.resolveOpinion(opinionId, { feedback, receiver })
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
    resolveOpinion
}