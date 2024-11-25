const express = require("express");
const router = express.Router()
const reward_punishmentController = require('../controllers/Reward_PunishmentController');

router.post('/create' , reward_punishmentController.createReward_Punishment);
router.get('/get-all/' , reward_punishmentController.getAllReward_Punishment);
router.get('/get-detail/:id' , reward_punishmentController.getDetailReward_Punishment);
router.delete('/delete/:id' , reward_punishmentController.deleteReward_Punishment);
router.put('/update/:id' , reward_punishmentController.updateReward_Punishment);

module.exports = router