const express = require("express");
const router = express.Router()
const ticketController = require('../controllers/TicketController');

router.post('/create' , ticketController.createTicket);
router.get('/get-all/' , ticketController.getAllTicket);
router.get('/get-detail/:id' , ticketController.getDetailTicket);

module.exports = router