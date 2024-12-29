const express = require("express");
const router = express.Router()
const scheduleController = require('../controllers/ScheduleController');

router.post('/create' , scheduleController.createSchedule);
router.get('/get-all' , scheduleController.getAllSchedule);
router.get('/get-all-add' , scheduleController.getAllAdd);
router.get('/get-detail/:id' , scheduleController.getDetailSchedule);
router.delete('/delete/:id' , scheduleController.deleteSchedule);
router.put('/edit', scheduleController.updateSchedule);

module.exports = router