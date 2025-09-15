// server/routes/campaignRoutes.js
const router = require("express").Router();
const ctl = require("../controllers/campaign_controller");
const validateToken = require("../middlewares/validateToken");

router.post("/preview", validateToken, ctl.previewAudience);
router.post("/create",  validateToken, ctl.createCampaign);
router.get("/history",  validateToken, ctl.history);

module.exports = router;
