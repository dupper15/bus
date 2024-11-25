const express = require("express");
const router = express.Router()
const busController = require('../controllers/BusController');

router.post('/create' , busController.createBus);
router.put('/update/:id' , busController.updateBus);
router.get('/get-all' , busController.getAllBus);
router.get('/get-detail/:id' , busController.getDetailBus);
router.delete('/delete/:id' , busController.deleteBus);

module.exports = router