const express = require("express");
const router = express.Router()
const imageController = require('../controllers/ImageController');

router.post('/create' , imageController.createImage);
router.get('/get-all/' , imageController.getAllImage);
router.get('/get-detail/:id' , imageController.getDetailImage);
router.delete('/delete/:id' , imageController.deleteImage);
router.put('/update/:id' , imageController.updateImage);

module.exports = router