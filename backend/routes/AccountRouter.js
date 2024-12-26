const express = require("express");
const router = express.Router()
const accountController = require('../controllers/AccountController');
const  {authMiddleware} = require('../authMiddlewares/authMiddleware');

router.post('/log-in' , accountController.loginAccount);
router.post('/log-out', accountController.logoutAccount);
router.get('/get-detail/:id', authMiddleware, accountController.getDetailAccount);
router.post('/refresh-token' , accountController.refreshTokenJwt);
router.put('/change-password' , accountController.changePassword);

module.exports = router