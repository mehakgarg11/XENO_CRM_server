const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analytics_controller");
const validateToken = require("../middlewares/validateToken");


router.get("/overview", validateToken, analyticsController.overview);
router.get("/campaign-performance", validateToken, analyticsController.campaignPerformance);

module.exports = router;