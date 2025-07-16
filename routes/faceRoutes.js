const express = require('express');
const router = express.Router();
const faceController = require('../controllers/faceController');

router.post('/capture', faceController.capture);
router.post('/register-image', faceController.registerImage);
router.get('/health', faceController.healthCheck);

module.exports = router;
