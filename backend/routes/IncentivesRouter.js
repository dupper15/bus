const express = require("express");
const router = express.Router()
const incentivesController = require('../controllers/IncentivesController');

router.post('/create' , incentivesController.createIncentives);
router.get('/get-all/' , incentivesController.getAllIncentives);
router.get('/get-detail/:id' , incentivesController.getDetailIncentives);
router.delete('/delete', incentivesController.deleteIncentives);
router.put('/edit', incentivesController.updateIncentives);

module.exports = router