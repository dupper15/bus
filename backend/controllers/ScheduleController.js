const ScheduleService = require('../services/ScheduleService')
require("../services/OpinionService");
const createSchedule =  async (req, res) => {
    try {
        const { bus, line, driver, busboy, time_start, status} = req.body
        if (!bus || !line || !driver || !busboy || !time_start || !status) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'All fields are required.'
            })
        }

        const response = await ScheduleService.createSchedule(req.body)
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
        const ScheduleId = req.params.id
        const data = req.body
        if (!ScheduleId) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Schedule ID is required.'
            })
        }
        const response = await ScheduleService.updateSchedule(ScheduleId, data)
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

const deleteSchedule =  async (req, res) => {
    try {
        const ScheduleId = req.params.id
        if (!ScheduleId){
            return res.status(400).json({
                status: 'ERROR',
                message: 'Schedule ID is required.'
            })
        }
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

module.exports = {
    createSchedule,
    getDetailSchedule,
    updateSchedule,
    getAllSchedule,
    deleteSchedule
}