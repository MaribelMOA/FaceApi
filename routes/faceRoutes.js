const express = require('express');
const faceController = require('../controllers/faceController');

const router = express.Router();

router.post('/identify', faceController.identify);
router.post('/register-image', faceController.registerImage);
//router.post('/register-visit', faceController.registerVisit);
router.delete('/delete-tempImage/:tempFileName', faceController.deleteTempImage);
router.get('/get-image', faceController.getImage);
router.delete('/delete-image/:fileName', faceController.deleteImage);
//router.get('/images-by-date', faceController.getImagesByDate);
//router.get('/check-camera', faceController.checkCamera);
router.get('/check-aws', faceController.checkAWS);



// nuevas rutas
router.get('/images/by-user/:userId', faceController.getImagesByUserId);
router.get('/images/by-realfilename', faceController.getImagesByRealFileName);
router.get('/images/by-user-date', faceController.getImagesByUserIdAndDate);


module.exports = router;