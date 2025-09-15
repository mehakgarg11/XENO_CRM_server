
const axios = require("axios");
const Customer = require("../models/Customer");
const Campaign = require("../models/Campaign");
const CommunicationLog = require("../models/CommunicationLog");

function baseUrl() {
  const port = process.env.PORT || 5000;
  return process.env.PUBLIC_URL || process.env.VITE_API_URL || `http://localhost:${port}`;
}

function firstName(c) {
  const n = c?.firstName || c?.name || c?.fullName || "";
  return String(n).trim().split(/\s+/)[0] || "there";
}

function renderMessage(template, customer) {
  const fallback = `Hi ${firstName(customer)}, here’s 10% off on your next order!`;
  const t = (template || "").trim() || fallback;
  return t.replace(/\{\{\s*name\s*\}\}/gi, firstName(customer));
}

// ---------- Preview ----------
async function previewAudience(req, res) {
  try {
    const rule = req.body?.rule || req.body || {};
    const audienceCount = await Customer.countDocuments(rule);
    res.json({ status: true, audienceCount });
  } catch (e) {
    res.status(500).json({ status: false, error: e.message });
  }
}

// ---------- Dispatch (vendor send -> webhook receipt) ----------
async function dispatchQueued(campaignId, chunk = 500) {
  while (true) {
    const logs = await CommunicationLog
      .find({ campaignId, status: "QUEUED" })
      .select("_id campaignId")
      .limit(chunk)
      .lean();
    if (!logs.length) break;

    await CommunicationLog.updateMany(
      { _id: { $in: logs.map(l => l._id) } },
      { $set: { status: "PENDING", updatedAt: new Date() } }
    );

    for (const l of logs) {
      axios.post(`${baseUrl()}/vendor/send`, { logId: l._id, campaignId }).catch(() => {});
    }
  }
}

// ---------- Create ----------
async function createCampaign(req, res) {
  try {
    const {
      name, description = "", objective = "custom",
      message = "", rule = {}, scheduledAt = null, createdBy = "webuser"
    } = req.body || {};

    if (!name?.trim()) {
      return res.status(400).json({ status: false, error: "name required" });
    }

    const audienceCount = await Customer.countDocuments(rule);
    const now = new Date();
    const scheduleDate = scheduledAt ? new Date(scheduledAt) : null;
    const status = scheduleDate && scheduleDate > now ? "scheduled" : "active";

    const campaign = await Campaign.create({
      name: name.trim(),
      description,
      objective,
      message,
      rule,
      audienceCount,
      scheduledAt: scheduleDate,
      status,
      createdBy
    });

   
    const cursor = Customer.find(rule, { _id: 1, name: 1, firstName: 1 }).cursor();
    const ops = [];
    for (let cust = await cursor.next(); cust; cust = await cursor.next()) {
      ops.push({
        insertOne: {
          document: {
            campaignId: campaign._id,
            customerId: cust._id,
            message: renderMessage(message, cust),
            status: "QUEUED"
          }
        }
      });
      if (ops.length === 1000) { await CommunicationLog.bulkWrite(ops, { ordered: false }); ops.length = 0; }
    }
    if (ops.length) await CommunicationLog.bulkWrite(ops, { ordered: false });

    if (status === "active") setImmediate(() => dispatchQueued(campaign._id).catch(() => {}));

    res.json({ status: true, obj: { _id: campaign._id, audienceCount, status } });
  } catch (e) {
    res.status(500).json({ status: false, error: e.message });
  }
}

// ---------- History ----------
async function history(req, res) {
  try {
    const agg = await CommunicationLog.aggregate([
      { $group: {
          _id: "$campaignId",
          sent:   { $sum: { $cond: [{ $eq: ["$status", "SENT"] },   1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0] } }
      }}
    ]);
    const map = new Map(agg.map(r => [String(r._id), r]));

    const campaigns = await Campaign.find({}).sort({ createdAt: -1 }).lean();
    res.json({
      status: true,
      obj: campaigns.map(c => ({
        _id: c._id,
        name: c.name,
        audienceCount: c.audienceCount || 0,
        createdBy: c.createdBy,
        createdAt: c.createdAt,
        status: c.status || "draft",
        sent:   map.get(String(c._id))?.sent   || 0,
        failed: map.get(String(c._id))?.failed || 0
      }))
    });
  } catch (e) {
    res.status(500).json({ status: false, error: e.message });
  }
}

module.exports = { previewAudience, createCampaign, history };

