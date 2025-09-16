const express = require('express');
const router = express.Router();
const campaignAI = require('../controllers/campaignAIController');
const validateToken = require('../middlewares/validateToken');

router.post('/parse-rule', validateToken, campaignAI.parseRule);
router.post('/suggest-messages', validateToken, campaignAI.suggestMessages);
router.post('/analytics', validateToken, campaignAI.campaignAnalytics);

module.exports = router;
