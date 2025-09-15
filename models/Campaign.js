const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  objective: {
    type: String,
    enum: ['promotion', 'winback', 'announcement', 'custom'],
    default: 'custom'
  },
  rule: { type: Object, required: true },     
  audienceCount: { type: Number, default: 0 },
  message: String,
  scheduledAt: Date,
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'completed'],
    default: function () {
      return this.scheduledAt ? 'scheduled' : 'active';
    }
  },
  createdBy: String,
}, { timestamps: true });

module.exports = mongoose.model('Campaign', CampaignSchema);
