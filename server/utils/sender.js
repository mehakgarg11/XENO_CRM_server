const axios = require("axios");

const BATCH_SIZE = 25;          
const TICK_MS    = 300;         
const queue = [];
let timer = null;

function start() {
  if (timer) return;
  timer = setInterval(flush, TICK_MS);
}

async function flush() {
  if (!queue.length) {
    clearInterval(timer); timer = null;
    return;
  }
  const batch = queue.splice(0, BATCH_SIZE);
  const base = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

  await Promise.all(
    batch.map(j =>
      axios.post(`${base}/vendor/send`, {
        logId: j._id,
        to: j.to,
        message: j.message,
        callbackUrl: `${base}/vendor/receipt`
      }).catch(() => {})   
    )
  );
}

function enqueueSend(jobs) {
  queue.push(...jobs);
  start();
}

module.exports = { enqueueSend };
