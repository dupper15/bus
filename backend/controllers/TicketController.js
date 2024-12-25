const TicketService = require('../services/TicketService')

const createTicket =  async (req, res) => {
    try {
        const data = req.body;
        const response = await TicketService.createTicket(data)
        return res.status(201).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while creating the ticket.',
            error: e
        })
    }
}

const getAllTicket =  async (req, res) => {
    try {
        const response = await TicketService.getAllTicket()
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

module.exports = {
    createTicket,
    getAllTicket
}