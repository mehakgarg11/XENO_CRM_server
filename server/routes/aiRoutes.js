// server/routes/aiRoutes.js
const express = require('express');
const router = express.Router();

const { getDashboardInsights, generateCustomerPersona } = require('../controllers/aiController');

const validateToken = require('../middlewares/validateToken'); 

router.post('/insights', validateToken, getDashboardInsights);

router.post('/persona', validateToken, generateCustomerPersona);

module.exports = router;

