const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const Campaign = require("../models/Campaign");
const CommunicationLog = require("../models/CommunicationLog");

exports.overview = async (req, res, next) => {
  try {
    const [
      customersCount, 
      ordersCount, 
      revenueAgg, 
      campaigns,
      topCustomers
    ] = await Promise.all([
      Customer.countDocuments({}),
      Order.countDocuments({}),
      
      Customer.aggregate([{ $group: { _id: null, total: { $sum: "$totalSpend" } } }]), 
      Campaign.find({}).sort({ createdAt: -1 }).limit(5).lean(),
      Customer.find({})
        .sort({ totalSpend: -1 })
        .limit(5)
        .select("name visits totalSpend")
        .lean(),
    ]);

    const revenue = revenueAgg?.[0]?.total || 0;
    
    const activeCampaigns = await Campaign.countDocuments({ 
      status: { $in: ["active", "scheduled"] } 
    });
    
    res.json({
      obj: {
        totals: {
          customers: customersCount,
          orders: ordersCount,
          activeCampaigns,
          revenue,
        },
        recentCampaigns: campaigns,
        topCustomers: topCustomers,
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.campaignPerformance = async (req, res, next) => {
  try {
    const { range = "7d", campaign = "all" } = req.query;
    const daysAgo = { "7d": 7, "30d": 30, "90d": 90 }[range] || 7;
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - daysAgo);

    const matchQuery = { createdAt: { $gte: sinceDate } };
    if (campaign !== "all" && mongoose.Types.ObjectId.isValid(campaign)) {
      matchQuery.campaignId = new mongoose.Types.ObjectId(campaign);
    }

    const performanceData = await CommunicationLog.aggregate([
        { $match: matchQuery },
        { $group: {
            _id: "$campaignId",
            sent: { $sum: { $cond: [{ $eq: ["$status", "SENT"] }, 1, 0] } },
        }},
        { $lookup: { from: "campaigns", localField: "_id", foreignField: "_id", as: "campaignDetails" }},
        { $unwind: "$campaignDetails" },
        { $project: {
            _id: 0, campaignId: "$_id", name: "$campaignDetails.name",
            sent: "$sent", opened: 0, clicked: 0, converted: 0, revenue: 0,
        }}
    ]);

    const totalSent = performanceData.reduce((sum, c) => sum + c.sent, 0);

    res.json({
      cards: { totalSent, openRate: 0, clickRate: 0, conversionRate: 0 },
      rows: performanceData,
    });
  } catch (err) {
    next(err);
  }
};