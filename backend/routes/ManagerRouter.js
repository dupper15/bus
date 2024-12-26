const express = require("express");
const router = express.Router();
const managerController = require("../controllers/ManagerController");

router.post("/create", managerController.createManager);
router.post("/log-in", managerController.loginManager);
router.put("/change-status/:id", managerController.changeStatusManager);
router.put("/edit", managerController.updateManager);
router.delete("/delete/:id", managerController.deleteManager);
router.get("/get-all", managerController.getAllManager);
router.get("/get-detail/:id", managerController.getDetailManager);
router.post("/refresh-token", managerController.refreshTokenJwtManager);

module.exports = router;
