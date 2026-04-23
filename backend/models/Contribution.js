const mongoose = require('mongoose');

const ContributionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  repository: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['commit', 'pull_request', 'issue', 'repository', 'other'],
    default: 'commit'
  },
  status: {
    type: String,
    enum: ['planned', 'in_progress', 'completed'],
    default: 'planned'
  },
  url: String,
  notes: String,
  contributionDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Contribution', ContributionSchema);
