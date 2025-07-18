const userModel = require('../models/userModel');

async function getOrCreateUser(req, res) {
  const { faceId, externalImageId } = req.body;
  if (!faceId || !externalImageId) {
    return res.status(400).json({ success: false, message: 'Missing faceId or externalImageId' });
  }

  try {
    const user = await userModel.getUser(faceId, externalImageId);
    res.json({ success: true, user });
  } catch (err) {
    console.error('Error in getOrCreateUser:', err);
    res.status(500).json({ success: false, message: 'Internal error' });
  }
}

module.exports = {
  getOrCreateUser
};
