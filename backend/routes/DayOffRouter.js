const express = require("express");
const router = express.Router()
const dayOffController = require('../controllers/DayOffController');

router.post('/create' , dayOffController.createDayOff);
router.get('/get-all/' , dayOffController.getAllDayOff);
router.get('/get-detail/:id' , dayOffController.getDetailDayOff);
router.delete('/delete/:id' , dayOffController.deleteDayOff);
router.put('/update/:id' , dayOffController.updateDayOff);

module.exports = router