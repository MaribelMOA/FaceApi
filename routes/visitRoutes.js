const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');

router.post('/save', visitController.saveVisit);
router.get('/total/:visitorId', visitController.getTotalDailyAmount);

module.exports = router;
