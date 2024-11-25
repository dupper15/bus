const express = require("express");
const router = express.Router()
const opinionController = require('../controllers/OpinionController');

router.post('/create' , opinionController.createOpinion);
router.get('/get-all' , opinionController.getAllOpinion);
router.get('/get-detail/:id' , opinionController.getDetailOpinion);
router.put('/resolve/:id' , opinionController.resolveOpinion);

module.exports = router