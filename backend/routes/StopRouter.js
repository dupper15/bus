const express = require("express");
const router = express.Router()
const stopController = require('../controllers/StopController');

router.post('/create' , stopController.createStop);
router.get('/get-all/' , stopController.getAllStop);
router.get('/get-detail/:id' , stopController.getDetailStop);
router.delete('/delete/:id' , stopController.deleteStop);
router.put('/update/:id' , stopController.updateStop);

module.exports = router