const transactionModel = require('../models/transactionModel');

async function saveTransaction(req, res) {
  const { userId, type, amount, imagePath } = req.body;

  if (!userId || !type || !amount || !imagePath) {
    return res.status(400).json({ success: false, message: 'Missing data for transaction' });
  }

  try {
    await transactionModel.saveTransaction(userId, type, amount, imagePath);
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving transaction:', err);
    res.status(500).json({ success: false, message: 'Failed to save transaction' });
  }
}

async function getTotalDailyAmount(req, res) {
  const { userId } = req.params;

  try {
    const total = await transactionModel.getTotalDailyAmount(userId);
    res.json({ success: true, total });
  } catch (err) {
    console.error('Error getting daily amount:', err);
    res.status(500).json({ success: false, message: 'Error retrieving total' });
  }
}

async function getAllTransactions(req, res) {
  try {
    const transactions = await transactionModel.getTransactions();
    res.json({ success: true, transactions });
  } catch (err) {
    console.error('Error getting transactions:', err);
    res.status(500).json({ success: false, message: 'Internal error' });
  }
}

async function getTransactionById(req, res) {
  try {
    const transaction = await transactionModel.getTransactionById(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.json({ success: true, transaction });
  } catch (err) {
    console.error('Error getting transaction:', err);
    res.status(500).json({ success: false, message: 'Internal error' });
  }
}

async function updateTransaction(req, res) {
  try {
    const updated = await transactionModel.updateTransaction(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Transaction not found or nothing to update' });
    res.json({ success: true, transaction: updated });
  } catch (err) {
    console.error('Error updating transaction:', err);
    res.status(500).json({ success: false, message: 'Internal error' });
  }
}


async function deleteTransaction(req, res) {
  try {
    const deleted = await transactionModel.deleteTransaction(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.json({ success: true, deleted });
  } catch (err) {
    console.error('Error deleting transaction:', err);
    res.status(500).json({ success: false, message: 'Internal error' });
  }
}

module.exports = {
  saveTransaction,
  getTotalDailyAmount,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};
