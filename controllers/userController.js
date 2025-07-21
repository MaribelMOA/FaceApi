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

async function getUserById(req, res) {
  const { id } = req.params;
  try {
    const user = await userModel.getUserById(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    console.error('Error getting user by ID:', err);
    res.status(500).json({ success: false, message: 'Internal error' });
  }
}

async function getAllUsers(req, res) {
  try {
    const users = await userModel.getAllUsers();
    res.json({ success: true, users });
  } catch (err) {
    console.error('Error getting all users:', err);
    res.status(500).json({ success: false, message: 'Internal error' });
  }
}

async function updateUser(req, res) {
  const { id } = req.params;
  const { faceId, externalImageId } = req.body;

  // Verifica si al menos uno de los campos está presente
  if (!faceId && !externalImageId) {
    return res.status(400).json({ success: false, message: 'Provide at least one field to update (faceId or externalImageId)' });
  }

  try {
    const user = await userModel.updateUser(id, { faceId, externalImageId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ success: false, message: 'Internal error' });
  }
}


async function deleteUser(req, res) {
  const { id } = req.params;
  try {
    const user = await userModel.deleteUser(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted', user });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ success: false, message: 'Internal error' });
  }
}

module.exports = {
  getOrCreateUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser
};
