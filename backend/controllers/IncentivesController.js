const IncentivesService = require('../services/IncentivesService')

const createIncentives = async (req, res) => {
    try {
        const data = req.body;
        const response = await IncentivesService.createIncentives(data)
        return res.status(201).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while creating the Incentives.',
            error: e
        })
    }
}

const getDetailIncentives = async (req, res) => {
    try {
        const IncentivesId = req.params.id
        if (!IncentivesId) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Incentives ID is required.'
            })
        }
        const response = await IncentivesService.getDetailIncentives(IncentivesId)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while retrieving the Incentives details.',
            error: e
        })
    }
}

const updateIncentives = async (req, res) => {
    try {
        const data = req.body
        const response = await IncentivesService.updateIncentives(data)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while updating the Incentives.'
        })
    }
}

const getAllIncentives = async (req, res) => {
    try {
        const response = await IncentivesService.getAllIncentives()
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while retrieving the Incentivess.',
            error: e
        })
    }
}

const deleteIncentives = async (req, res) => {
    try {
        const data = req.body;
        console.log("data",data)
        const response = await IncentivesService.deleteIncentives(data)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while deleting the Incentives.',
            error: e
        })
    }
}

module.exports = {
    createIncentives,
    getDetailIncentives,
    updateIncentives,
    getAllIncentives,
    deleteIncentives
}