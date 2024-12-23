const express = require("express");
const router = express.Router()
const customerController = require('../controllers/CustomerController');
const { authCustomerMiddleware } = require("../authMiddlewares/authMiddleware");

router.post('/sign-up' , customerController.createCustomer);
router.post('/log-in' , customerController.loginCustomer);
router.put('/update/:id' , customerController.updateCustomer);
// router.put('/update-password/:id' , customerController.updatePasswordCustomer);
router.get('/get-all', customerController.getAllCustomer);
router.get('/get-detail/:id', authCustomerMiddleware, customerController.getDetailCustomer);
router.post('/refresh-token' , customerController.refreshTokenJwtCustomer);

module.exports = router