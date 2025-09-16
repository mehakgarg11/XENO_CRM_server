const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GENAI_API);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const CommunicationLog = require('../models/CommunicationLog');
const Customer = require('../models/Customer');

let parseRule = async (req, res) => {
    try {
        const { ruleText } = req.body;
        const prompt = `Convert this rule into a JSON query for MongoDB: "${ruleText}"`;
        const result = await model.generateContent([{ input: prompt }]);
        const jsonRule = JSON.parse(result.response.text());
        res.json({ status: true, obj: jsonRule });
    } catch (err) {
        res.status(500).json({ status: false, error: err.message });
    }
};

let suggestMessages = async (req, res) => {
    try {
        const { campaignName } = req.body;
        const prompt = `Generate 3 short SMS templates for campaign named "${campaignName}"`;
        const result = await model.generateContent([{ input: prompt }]);
        const messages = result.response.text().split('\n').filter(m => m);
        res.json({ status: true, obj: messages });
    } catch (err) {
        res.status(500).json({ status: false, error: err.message });
    }
};

let campaignAnalytics = async (req, res) => {
    try {
        const { campaignId } = req.body;
        const logs = await CommunicationLog.find({ campaignId });
        const summary = {
            total: logs.length,
            sent: logs.filter(l => l.status === 'SENT').length,
            failed: logs.filter(l => l.status === 'FAILED').length,
            retry: logs.filter(l => l.status === 'RETRY').length
        };
        res.json({ status: true, obj: summary });
    } catch (err) {
        res.status(500).json({ status: false, error: err.message });
    }
};

module.exports = { parseRule, suggestMessages, campaignAnalytics };
