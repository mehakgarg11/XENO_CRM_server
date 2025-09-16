// server/models/Customer.js
const mongoose = require('mongoose');

let schema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  totalSpend: { type: Number, default: 0 },
  visits: { type: Number, default: 0 },
  lastOrderAt: Date,
  location: { type: String, default: "" } 
});

schema.index({ totalSpend: 1 });
schema.index({ visits: 1 });
schema.index({ lastOrderAt: -1 });
schema.index({ location: 1 });

module.exports = mongoose.model('customers', schema);
