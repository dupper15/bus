const express = require("express");
const dashboardController = require("../controllers/DashboardController");
const router = express.Router();
router.get("/get-sumary", dashboardController.getSumary);
module.exports = router;
