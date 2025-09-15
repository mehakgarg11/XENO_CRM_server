// server/routes/webhookRoutes.js
const router = require("express").Router();
const CommunicationLog = require("../models/CommunicationLog");
const Campaign         = require("../models/Campaign");

const logOps = [];
const incByCampaign = new Map();

async function flush() {
  const ops  = logOps.splice(0, logOps.length);
  const incs = Array.from(incByCampaign.entries());
  incByCampaign.clear();

  if (ops.length) await CommunicationLog.bulkWrite(ops, { ordered: false });
  if (incs.length) {
    await Promise.all(
      incs.map(([id, inc]) => Campaign.updateOne({ _id: id }, { $inc: inc }))
    );
  }
}
setInterval(() => flush().catch(() => {}), 300);

router.post("/vendor/receipt", async (req, res) => {
  const { logId, campaignId, vendorMessageId, status, error } = req.body || {};

  logOps.push({
    updateOne: {
      filter: { _id: logId },
      update: {
        $set: {
          vendorMessageId,
          status: status === "SENT" ? "SENT" : "FAILED",
          error:  status === "FAILED" ? (error || "failed") : undefined,
          updatedAt: new Date()
        }
      }
    }
  });

  const key = String(campaignId);
  const inc = incByCampaign.get(key) || { sent: 0, failed: 0 };
  if (status === "SENT") inc.sent += 1; else inc.failed += 1;
  incByCampaign.set(key, inc);

  res.json({ ok: true });
});

module.exports = router;
