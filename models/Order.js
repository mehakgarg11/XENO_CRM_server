let mongoose = require('mongoose');

let schema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'customers' },
    amount: Number,
    date: { type: Date, default: Date.now }
});

let orderModel = mongoose.model('orders', schema);
module.exports = orderModel;
