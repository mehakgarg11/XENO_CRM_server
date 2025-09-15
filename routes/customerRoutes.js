const express = require('express');
const router = express.Router();
const customerCtrl = require('../controllers/customer_controller');
const validateToken = require('../middlewares/validateToken');
const validate = require('../utils/validate');
const { bulkInsertSchema } = require('../validators/customer');

router.post('/bulk', validateToken, validate(bulkInsertSchema), customerCtrl.bulkInsert);

router.get('/all', validateToken, customerCtrl.getAllCustomers);

module.exports = router;
