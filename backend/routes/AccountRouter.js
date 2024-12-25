const express = require("express");
const router = express.Router()
const accountController = require('../controllers/AccountController');

router.post('/log-in' , accountController.loginAccount);
router.post('/log-out', accountController.logoutAccount);

module.exports = router