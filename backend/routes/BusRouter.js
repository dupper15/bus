const express = require("express");
const router = express.Router()
const busController = require('../controllers/BusController');

router.post('/create' , busController.createBus);
router.put('/edit' , busController.updateBus);
router.get('/get-all' , busController.getAllBus);
router.get('/get-detail/:id' , busController.getDetailBus);
router.delete('/delete' , busController.deleteBus);

module.exports = router