const express = require('express');
const router = express.Router();
const orderCtrl = require('../controllers/order_controller');
const validateToken = require('../middlewares/validateToken');
const validate = require('../utils/validate');
const { createOrderSchema } = require('../validators/order');

router.post('/create', validateToken, validate(createOrderSchema), orderCtrl.insertOrder);
router.get('/all', validateToken, orderCtrl.getAllOrders);

module.exports = router;
