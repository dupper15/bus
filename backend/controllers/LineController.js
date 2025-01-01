const LineService = require('../services/LineService')

const createLine = async (req, res) => {
    try {
        const { name, start_place, end_place, time, arr_stop } = req.body
        if (!name || !start_place || !end_place || !time || !arr_stop) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'All fields are required.'
            })
        }

        const response = await LineService.createLine(req.body)
        return res.status(201).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while creating the line.',
            error: e
        })
    }
}

const updateLine = async (req, res) => {
    try {
        const LineId = req.params.id
        const data = req.body
        if (!LineId) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Line ID is required.'
            })
        }
        const response = await LineService.updateLine(LineId, data)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while updating the line.',
            error: e
        })
    }
}

const getAllLine = async (req, res) => {
    try {
        const response = await LineService.getAllLine()
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while retrieving the lines.',
            error: e
        })
    }
}

const getDetailLine = async (req, res) => {
    try {
        const LineId = req.params.id
        if (!LineId) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Line ID is required.'
            })
        }
        const response = await LineService.getDetailLine(LineId)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while retrieving the line details.',
            error: e
        })
    }
}

const deleteLine = async (req, res) => {
    try {
        const LineId = req.params.id
        if (!LineId) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Line ID is required.'
            })
        }
        const response = await LineService.deleteLine(LineId)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while deleting the line.',
            error: e
        })
    }
}

const getAllSchedule = async (req, res) => {
    try {
        const LineId = req.params.id
        const response = await LineService.getAllSchedule(LineId)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while retrieving the line details.',
            error: e
        })
    }
}

module.exports = {
    createLine,
    updateLine,
    getAllLine,
    getDetailLine,
    deleteLine,
    getAllSchedule
}