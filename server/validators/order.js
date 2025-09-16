// server/validators/order.js
const Joi = require("joi");

exports.createOrderSchema = Joi.object({
  customerId: Joi.string().hex().length(24).required(),
  amount: Joi.number().min(0).required(),
  items: Joi.array().items(
    Joi.object({
      sku: Joi.string().required(),
      qty: Joi.number().integer().min(1).required(),
      price: Joi.number().min(0).required()
    })
  ).default([])
});
