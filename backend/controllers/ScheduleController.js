const ScheduleService = require('../services/ScheduleService')
require("../services/OpinionService");
const createSchedule =  async (req, res) => {
    try {
        const data = req.body;
        const response = await ScheduleService.createSchedule(data)
        return res.status(201).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while creating the schedule.',
            error: e
        })
    }
}

const getDetailSchedule =  async (req, res) => {
    try {
        const ScheduleId = req.params.id
        if (!ScheduleId){
            return res.status(400).json({
                status: 'ERROR',
                message: 'Schedule ID is required.'
            })
        }
        const response = await ScheduleService.getDetailSchedule(ScheduleId)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while retrieving the schedule details.',
            error: e
        })
    }
}

const updateSchedule = async (req, res) => {
    try {
        const data = req.body
        const response = await ScheduleService.updateSchedule(data)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while updating the schedule.'
        })
    }
}

const getAllSchedule =  async (req, res) => {
    try {
        const response = await ScheduleService.getAllSchedule()
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while retrieving the schedules.',
            error: e
        })
    }
}


const getAllAdd =  async (req, res) => {
    try {
        const response = await ScheduleService.getAllAdd()
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while retrieving the schedules.',
            error: e
        })
    }
}

const deleteSchedule =  async (req, res) => {
    try {
        const ScheduleId = req.params.id
        const response = await ScheduleService.deleteSchedule(ScheduleId)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while deleting the schedule.',
            error: e
        })
    }
}

const approveAllSchedule = async (req, res) => {
    try {
        const response = await ScheduleService.approveAllSchedule()
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while updating the schedule.'
        })
    }
}

module.exports = {
    createSchedule,
    getDetailSchedule,
    updateSchedule,
    getAllSchedule,
    deleteSchedule,
    getAllAdd,
    approveAllSchedule
}