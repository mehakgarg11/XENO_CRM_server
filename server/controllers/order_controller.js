const Order = require('../models/Order');
const Customer = require('../models/Customer');


let insertOrder = async (req, res) => {
    try {
        const { customerId, amount, items } = req.body;

        const order = await Order.create({ customerId, amount, items, createdAt: new Date() });

       
        await Customer.findByIdAndUpdate(customerId, {
            $inc: { totalSpend: amount, visits: 1 },
            $set: { lastOrderAt: new Date() }
        });

        res.json({ status: true, msg: 'Order inserted and customer updated', obj: order });
    } catch (err) {
        res.status(500).json({ status: false, error: err.message });
    }
};


let getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        res.json({ status: true, obj: orders });
    } catch (err) {
        res.status(500).json({ status: false, error: err.message });
    }
};

module.exports = { insertOrder, getAllOrders };
