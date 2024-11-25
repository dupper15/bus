const express = require("express");
const router = express.Router()
const managerController = require('../controllers/ManagerController');
const {authManagerMiddleware } = require("../authMiddlewares/authMiddleware");

router.post('/create' , managerController.createManager);
router.post('/log-in' , managerController.loginManager);
router.put('/update/:id' , managerController.updateManager);
router.get('/get-all' , managerController.getAllManager);
router.get('/get-detail/:id', authManagerMiddleware, managerController.getDetailManager);
router.post('/refresh-token' , managerController.refreshTokenJwtManager);

module.exports = router