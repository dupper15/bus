const BillService = require('../services/MaintenanceBillService')

const createBill =  async (req, res) => {
    try {
        const data = req.boy
        const response = await BillService.createBill(data)
        return res.status(201).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while creating the bill.',
            error: e
        })
    }
}

const getAllBill =  async (req, res) => {
    try {
        const response = await BillService.getAllBill()
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while retrieving the bills.',
            error: e
        })
    }
}

const getDetailBill =  async (req, res) => {
    try {
        const billId = req.params.id
        if (!billId){
            return res.status(400).json({
                status: 'ERROR',
                message: 'Bill ID is required.'
            })
        }
        const response = await BillService.getDetailBill(billId)
        return res.status(200).json(response)
    } catch (e) {
        console.error(e)
        return res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while retrieving the bill details.',
            error: e
        })
    }
}

module.exports = {
    createBill,
    getAllBill,
    getDetailBill,
}