const express = require("express");
const router = express.Router()
const billController = require('../controllers/MaintenanceBillController');

router.post('/create' , billController.createBill);
router.get('/get-all' , billController.getAllBill);
router.get('/get-detail/:id' , billController.getDetailBill);

module.exports = router