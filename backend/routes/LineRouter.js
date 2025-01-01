const express = require("express");
const router = express.Router()
const lineController = require('../controllers/LineController');

router.post('/create' , lineController.createLine);
router.put('/update/:id' , lineController.updateLine);
router.get('/get-all' , lineController.getAllLine);
router.get('/get-detail/:id' , lineController.getDetailLine);
router.delete('/delete/:id' , lineController.deleteLine);
router.get('/get-all-schedule/:id', lineController.getAllSchedule);

module.exports = router