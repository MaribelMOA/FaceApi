const visitModel = require('../models/visitModel');

async function saveVisit(req, res) {
  const { userId, type, amount, imagePath } = req.body;

  if (!userId || !type || !amount || !imagePath) {
    return res.status(400).json({ success: false, message: 'Missing data for visit' });
  }

  try {
    await visitModel.saveVisit(userId, type, amount, imagePath);
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving visit:', err);
    res.status(500).json({ success: false, message: 'Failed to save visit' });
  }
}

async function getTotalDailyAmount(req, res) {
  const { userId } = req.params;

  try {
    const total = await visitModel.getTotalDailyAmount(userId);
    res.json({ success: true, total });
  } catch (err) {
    console.error('Error getting daily amount:', err);
    res.status(500).json({ success: false, message: 'Error retrieving total' });
  }
}

module.exports = {
  saveVisit,
  getTotalDailyAmount
};
