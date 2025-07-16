const visitModel = require('../models/visitModel');

async function saveVisit(req, res) {
  const { visitorId, type, amount, imagePath } = req.body;

  if (!visitorId || !type || !amount || !imagePath) {
    return res.status(400).json({ success: false, message: 'Missing data for visit' });
  }

  try {
    await visitModel.saveVisit(visitorId, type, amount, imagePath);
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving visit:', err);
    res.status(500).json({ success: false, message: 'Failed to save visit' });
  }
}

async function getTotalDailyAmount(req, res) {
  const { visitorId } = req.params;

  try {
    const total = await visitModel.getTotalDailyAmount(visitorId);
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
