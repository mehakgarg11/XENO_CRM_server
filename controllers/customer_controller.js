const Customer = require('../models/Customer');

let bulkInsert = async (req, res) => {
    try {
        const customers = req.body.customers; 
        const inserted = await Customer.insertMany(customers, { ordered: false });
        res.json({ status: true, msg: 'Customers inserted successfully', obj: inserted });
    } catch (err) {
        res.status(500).json({ status: false, error: err.message });
    }
};

let getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.find();
        res.json({ status: true, obj: customers });
    } catch (err) {
        res.status(500).json({ status: false, error: err.message });
    }
};

module.exports = { bulkInsert, getAllCustomers };
