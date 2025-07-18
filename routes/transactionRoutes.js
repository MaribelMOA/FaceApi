const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.post('/saveTransaction', transactionController.saveTransaction);
router.get('/users/:userId/accumulated', transactionController.getTotalDailyAmount);

module.exports = router;
