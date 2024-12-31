const express = require("express");
const dashboardController = require("../controllers/DashboardController");
const router = express.Router();

router.get("/get-sumary", dashboardController.getSumary);
router.get("/get-revenue", dashboardController.getRevenue);
router.get("/get-line", dashboardController.getLine);
router.get("/get-bus", dashboardController.getBus);

module.exports = router;
