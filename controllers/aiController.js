// server/controllers/aiController.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Customer = require('../models/Customer'); 


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * FEATURE 1
 */
const getDashboardInsights = async (req, res) => {
    try {
        const { stats } = req.body;

        if (!stats) {
            return res.status(400).json({ message: 'Stats are required.' });
        }

        const prompt = `You are a business analyst for a CRM. Based on the following data, provide a 2-3 sentence human-readable summary with actionable insights.
- Total Customers: ${stats.customers}
- Active Campaigns: ${stats.active}
- Total Orders: ${stats.orders}
- Total Revenue: ${stats.revenue}
Focus on the most important metric and suggest a next step for the user.`;

        const result = await model.generateContent(prompt);
        const insights = result.response.text();

        res.status(200).json({ insights });
    } catch (error) {
        console.error('Insights Generation Error:', error);
        res.status(500).json({ message: 'Failed to generate insights.' });
    }
};

/**
 * FEATURE 2: 
 */
const generateCustomerPersona = async (req, res) => {
    try {
        const { audienceQuery } = req.body;
        if (!audienceQuery || Object.keys(audienceQuery).length === 0) {
            return res.status(400).json({ message: 'Audience query is required.' });
        }
        
        const customerCount = await Customer.countDocuments(audienceQuery);
        if (customerCount === 0) {
            return res.status(200).json({ persona: "No customers match this segment, so a persona cannot be generated." });
        }
        
        const prompt = `Based on a customer segment defined by the MongoDB query ${JSON.stringify(audienceQuery)}, create a short, 2-sentence marketing persona describing this type of customer.`;
        
        const result = await model.generateContent(prompt);
        res.status(200).json({ persona: result.response.text() });
    } catch (error) {
        console.error('Persona Generation Error:', error.message);
        res.status(500).json({ message: 'Failed to generate persona.' });
    }
};

module.exports = {
    getDashboardInsights,
    generateCustomerPersona
};