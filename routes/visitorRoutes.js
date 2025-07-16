const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');

router.post('/get-or-create', visitorController.getOrCreateVisitor);

module.exports = router;
