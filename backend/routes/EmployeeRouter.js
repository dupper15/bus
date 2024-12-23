const express = require("express");
const router = express.Router()
const employeeController = require('../controllers/EmployeeController');
const { authEmployeeMiddleware } = require("../authMiddlewares/authMiddleware");

router.post('/create' , employeeController.createEmployee);
router.post('/log-in' , employeeController.loginEmployee);
router.put('/edit/:id' , employeeController.updateEmployee);
router.put('/change-status/:id' , employeeController.changeStatus);
router.get('/get-all', employeeController.getAllEmployee);
router.get('/get-detail/:id' , employeeController.getDetailEmployee);
router.post('/refresh-token' , employeeController.refreshTokenJwtEmployee);
router.delete('/delete/:id' , employeeController.deleteEmployee);

module.exports = router