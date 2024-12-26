const express = require("express");
const router = express.Router()
const opinionController = require('../controllers/OpinionController');

router.post('/create' , opinionController.createOpinion);
router.get('/get-all' , opinionController.getAllOpinion);
router.get('/get-status', opinionController.getAllStatus);
router.get('/get-detail/:id' , opinionController.getDetailOpinion);
router.put('/resolve' , opinionController.resolveOpinion);

module.exports = router