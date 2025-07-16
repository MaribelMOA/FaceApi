const visitorModel = require('../models/visitorModel');

async function getOrCreateVisitor(req, res) {
  const { faceId, externalImageId } = req.body;
  if (!faceId || !externalImageId) {
    return res.status(400).json({ success: false, message: 'Missing faceId or externalImageId' });
  }

  try {
    const visitor = await visitorModel.getVisitor(faceId, externalImageId);
    res.json({ success: true, visitor });
  } catch (err) {
    console.error('Error in getOrCreateVisitor:', err);
    res.status(500).json({ success: false, message: 'Internal error' });
  }
}

module.exports = {
  getOrCreateVisitor
};
