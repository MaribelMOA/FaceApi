const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');

router.post('/saveTransaction', visitController.saveVisit);
router.get('/users/:visitorId/accumulated', visitController.getTotalDailyAmount);

module.exports = router;
