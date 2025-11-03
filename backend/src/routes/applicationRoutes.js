const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/applicationController");

console.log("📋 [applicationRoutes] Loaded");

//Router rút đơn ứng tuyển (tạm bỏ protect middleware)
router.put("/:id/withdraw", applicationController.withdrawApplication);

module.exports = router;

module.exports = router;
