const express = require('express');
const multer = require('multer');

const faceController = require('../controllers/faceController');
const router = express.Router();


const upload = multer({ storage: multer.memoryStorage() });

//OG
// router.post('/identify', faceController.identify);
router.post('/identify', upload.single('file'), faceController.identify);

router.post('/register-image', faceController.registerImage);
router.delete('/delete-tempImage/:tempFileName', faceController.deleteTempImage);
router.get('/get-image', faceController.getImage);
router.delete('/delete-image', faceController.deleteImage);
//router.get('/images-by-date', faceController.getImagesByDate);
//router.get('/check-camera', faceController.checkCamera);
router.get('/check-aws', faceController.checkAWS);



// nuevas rutas
router.get('/images/by-user/:userId', faceController.getImagesByUserId);
router.get('/images/by-realfilename', faceController.getImagesByRealFileName);
router.get('/images/by-user-date', faceController.getImagesByUserIdAndDate);


module.exports = router;