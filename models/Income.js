const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  source: { type: String, required: true }, // e.g., "salary", "freelance"
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Income = mongoose.model('Income', incomeSchema);
module.exports = Income;
