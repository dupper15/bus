const StopService = require('../services/StopService')
require("../services/OpinionService");
const createStop =  async (req, res) => {
    try {
        const { name, address, pointX, pointY , isStation} = req.body
        if (!name || !address || !pointX || !pointY || isStation === undefined) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'All fields are required.'
            })
        }

        const response = await StopService.createStop(req.body)
        return res.status(201).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while creating the stop.',
            error: e
        })
    }
}

const getDetailStop =  async (req, res) => {
    try {
        const StopId = req.params.id
        if (!StopId){
            return res.status(400).json({
                status: 'ERROR',
                message: 'Stop ID is required.'
            })
        }
        const response = await StopService.getDetailStop(StopId)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while retrieving the stop details.',
            error: e
        })
    }
}

const updateStop = async (req, res) => {
    try {
        const StopId = req.params.id
        const data = req.body
        if (!StopId) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Stop ID is required.'
            })
        }
        const response = await StopService.updateStop(StopId, data)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while updating the stop.'
        })
    }
}

const getAllStop =  async (req, res) => {
    try {
        const response = await StopService.getAllStop()
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while retrieving the stops.',
            error: e
        })
    }
}

const deleteStop =  async (req, res) => {
    try {
        const StopId = req.params.id
        if (!StopId){
            return res.status(400).json({
                status: 'ERROR',
                message: 'Stop ID is required.'
            })
        }
        const response = await StopService.deleteStop(StopId)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while deleting the stop.',
            error: e
        })
    }
}

module.exports = {
    createStop,
    getDetailStop,
    updateStop,
    getAllStop,
    deleteStop
}