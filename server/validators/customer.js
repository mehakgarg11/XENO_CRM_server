// server/validators/customer.js
const Joi = require("joi");

const customer = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow("", null),
  totalSpend: Joi.number().min(0).default(0),
  visits: Joi.number().integer().min(0).default(0),
  lastOrderAt: Joi.date().optional()
});

exports.bulkInsertSchema = Joi.object({
  customers: Joi.array().items(customer).min(1).required()
});
