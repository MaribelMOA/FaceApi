const express = require('express');
const multer = require('multer');

const faceController = require('../controllers/faceController');
const router = express.Router();


const upload = multer({ storage: multer.memoryStorage() });

//OG
router.post('/identify', upload.single('file'), faceController.identify);

router.post('/register-image', faceController.registerImage);
router.delete('/delete-tempImage/:tempFileName', faceController.deleteTempImage);

router.get('/check-aws', faceController.checkAWS);

//NEW
router.post('/register-and-transaction', faceController.registerImageAndSaveTransaction);


// Get imaages
router.get('/get-image', faceController.getImage);

router.get('/images/by-user/:userId', faceController.getImagesByUserId);
router.get('/images/by-realfilename', faceController.getImagesByRealFileName);
router.get('/images/by-user-date', faceController.getImagesByUserIdAndDate);

router.delete('/delete-image', faceController.deleteImage);

module.exports = router;