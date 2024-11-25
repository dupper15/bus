const BillService = require('../services/MaintenanceBillService')

const createBill =  async (req, res) => {
    try {
        const { bus , employee, start_date, end_date, content, price } = req.body
        if (!bus || !employee || !start_date || !end_date || !content || !price) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'All fields are required.'
            })
        }

        const startDate = new Date(start_date);
        const endDate = new Date(end_date);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Invalid date format.'
            });
        }

        if (startDate > endDate) {
            return res.status(400).json({
                status: 'ERROR',
                message: 'Start date cannot be later than end date.'
            });
        }
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        const billData = {
            bus,
            employee,
            start_date: startDate,
            end_date: endDate,
            content,
            price
        };

        console.log(billData)
        const response = await BillService.createBill(billData)
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
        const BillId = req.params.id
        if (!BillId){
            return res.status(400).json({
                status: 'ERROR',
                message: 'Bill ID is required.'
            })
        }
        const response = await BillService.getDetailBill(BillId)
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