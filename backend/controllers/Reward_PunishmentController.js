const Reward_PunishmentService = require('../services/Reward_PunishmentService')
require("../services/OpinionService");
const createReward_Punishment = async (req, res) => {
    try {
        const {employee, content, type, date, price} = req.body
        if (!employee || !content || !type || !date || !price) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'All fields are required.'
            })
        }

        const response = await Reward_PunishmentService.createReward_Punishment(req.body)
        return res.status(201).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while creating the reward_punishment.',
            error: e
        })
    }
}

const getDetailReward_Punishment = async (req, res) => {
    try {
        const Reward_PunishmentId = req.params.id
        if (!Reward_PunishmentId) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Reward_Punishment ID is required.'
            })
        }
        const response = await Reward_PunishmentService.getDetailReward_Punishment(Reward_PunishmentId)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while retrieving the reward_punishment details.',
            error: e
        })
    }
}

const updateReward_Punishment = async (req, res) => {
    try {
        const Reward_PunishmentId = req.params.id
        const data = req.body
        if (!Reward_PunishmentId) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Reward_Punishment ID is required.'
            })
        }
        const response = await Reward_PunishmentService.updateReward_Punishment(Reward_PunishmentId, data)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while updating the reward_punishment.'
        })
    }
}

const getAllReward_Punishment = async (req, res) => {
    try {
        const response = await Reward_PunishmentService.getAllReward_Punishment()
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while retrieving the reward_punishments.',
            error: e
        })
    }
}

const deleteReward_Punishment = async (req, res) => {
    try {
        const Reward_PunishmentId = req.params.id
        if (!Reward_PunishmentId) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Reward_Punishment ID is required.'
            })
        }
        const response = await Reward_PunishmentService.deleteReward_Punishment(Reward_PunishmentId)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while deleting the reward_punishment.',
            error: e
        })
    }
}

module.exports = {
    createReward_Punishment,
    getDetailReward_Punishment,
    updateReward_Punishment,
    getAllReward_Punishment,
    deleteReward_Punishment
}