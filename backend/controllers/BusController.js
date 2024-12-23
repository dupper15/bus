const BusService = require('../services/BusService')

const createBus = async (req, res) => {
    try {
        const data = req.body;
        const response = await BusService.createBus(data)
        return res.status(201).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while creating the bus.'
        })
    }
}

const updateBus = async (req, res) => {
    try {
        const busId = req.params.id;
        const data = req.body;
        if (!busId) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Bus ID is required.'
            })
        }
        const response = await BusService.updateBus(data)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while updating the bus.'
        })
    }
}

const getAllBus = async (req, res) => {
    try {
        const response = await BusService.getAllBus()
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while retrieving the buses.'
        })
    }
}

const getDetailBus = async (req, res) => {
    try {
        const BusId = req.params.id
        if (!BusId) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Bus ID is required.'
            })
        }
        const response = await BusService.getDetailBus(BusId)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while retrieving the bus details.'
        })
    }
}

const deleteBus = async (req, res) => {
    try {
        const busId = req.params.id
        if (!busId) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Bus ID is required.'
            })
        }
        const response = await BusService.deleteBus(busId)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while deleting the bus.'
        })
    }
}

module.exports = {
    createBus,
    updateBus,
    getAllBus,
    getDetailBus,
    deleteBus
}