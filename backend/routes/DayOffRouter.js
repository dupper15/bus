const express = require("express");
const router = express.Router()
const dayOffController = require('../controllers/DayOffController');

router.post('/create' , dayOffController.createDayOff);
router.get('/get-all/' , dayOffController.getAllDayOff);
router.get('/get-detail/:id', dayOffController.getDetailDayOff);
router.delete('/delete' , dayOffController.deleteDayOff);
router.put('/resolve' , dayOffController.updateDayOff);

module.exports = router