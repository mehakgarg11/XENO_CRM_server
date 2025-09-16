// server/routes/vendorRoutes.js
const router = require("express").Router();
const axios  = require("axios");

function baseUrl() {
  const port = process.env.PORT || 5000;
  return process.env.PUBLIC_URL || process.env.VITE_API_URL || `http://localhost:${port}`;
}

router.post("/send", async (req, res) => {
  const { logId, campaignId } = req.body || {};
  const vendorMessageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  res.json({ ok: true, vendorMessageId });

  const ok    = Math.random() < 0.9;                              // ~90% success
  const delay = 200 + Math.floor(Math.random() * 1200);           // 200–1400ms

  setTimeout(async () => {
    try {
      await axios.post(`${baseUrl()}/webhooks/vendor/receipt`, {
        logId, campaignId, vendorMessageId,
        status: ok ? "SENT" : "FAILED",
        error:  ok ? undefined : "Simulated vendor failure"
      });
    } catch (_) {}
  }, delay);
});

module.exports = router;
