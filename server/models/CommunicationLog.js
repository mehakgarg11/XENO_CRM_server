// server/models/CommunicationLog.js
const mongoose = require("mongoose");

const CommunicationLogSchema = new mongoose.Schema(
  {
    campaignId:  { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", index: true, required: true },
    customerId:  { type: mongoose.Schema.Types.ObjectId, ref: "Customer", index: true, required: true },

    message:         { type: String },
    provider:        { type: String, default: "dummyVendor" },
    channel:         { type: String, default: "sms" },
    vendorMessageId: { type: String },
    error:           { type: String },

    status: {
      type: String,
      enum: ["QUEUED", "PENDING", "SENT", "FAILED"],
      default: "QUEUED",
      index: true
    }
  },
  { timestamps: true, strict: true }
);

CommunicationLogSchema.index({ campaignId: 1, status: 1 });

module.exports = mongoose.model("CommunicationLog", CommunicationLogSchema);
