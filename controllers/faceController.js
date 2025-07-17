// controllers/faceController.js
const fs = require('fs');
const path = require('path');
const rekognitionService = require('../services/rekognitionService');
const bucketService = require('../services/GCStorageService');
const visitorModel = require('../models/visitorModel');
const visitModel = require('../models/visitModel');

const TEMP_DIR = path.join(__dirname, '../temp-images');

if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

module.exports = {
  // 1. Captura y reconocimiento facial
  identify: async (req, res) => {
        try {
        // Validar que venga imagen ORIGINAL
        //   if (!req.file || !req.file.buffer) {
        //     return res.status(400).json({ allowed: false, message: 'Image file is required' });
        //   }
        //   const imageBuffer = req.file.buffer;
            const { imageData } = req.body;

            if (!imageData) {
            return res.status(400).json({ allowed: false, message: 'Image data is required in base64 format' });
            }

            // Decodificar base64 a buffer
            const imageBuffer = Buffer.from(imageData, 'base64');



            const fileName = `face_${Date.now()}_${Math.random().toString(36).substring(2, 10)}.jpg`;
            const filePath = path.join(TEMP_DIR, fileName);
            fs.writeFileSync(filePath, imageBuffer);

            const { faceId, externalImageId, confidence, allowed } = await rekognitionService.recognizeFace(imageBuffer);
            return res.json({ face_id: faceId, external_image_id: externalImageId, image_file_path: fileName });
        } catch (err) {
            return res.status(500).json({ allowed: false, message: 'Recognition error', error: err.message });
        }
  },

//   // 2. Registrar visita localmente (JSON o DB)
//   registerVisit: async (req, res) => {
//     const { faceId, externalImageId } = req.body;
//     if (!faceId || !externalImageId) return res.status(400).json({ success: false, message: 'Missing data' });

//     await visitModel.register({ faceId, externalImageId });
//     return res.json({ success: true });
//   },

  // 3. Registrar imagen definitiva en S3
  registerImage: async (req, res) => {
    try {
        const { visitorId, tempFileName, realFileName } = req.query;

        if (!visitorId || !tempFileName || !realFileName) {
            return res.status(400).json({ success: false, message: 'visitorId, tempFileName, and realFileName are required' });
        }

        const filePath = path.join(TEMP_DIR, tempFileName);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'Temp image not found' });
        }

        const finalName = `visitas/${visitorId}/${realFileName}_${Date.now()}.jpg`;

        const imageUrl = await bucketService.uploadFile(filePath, finalName);
        fs.unlinkSync(filePath); // Borrar local después de subir

        return res.json({ success: true, imageUrl });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Image registration failed', error: err.message });
    }
  },

  // 4. Eliminar imagen temporal
  deleteTempImage: (req, res) => {
        const filePath = path.join(TEMP_DIR, req.params.tempFileName);
        if (!fs.existsSync(filePath)) {
             return res.status(404).json({ success: false, message: 'Temp image not found' });
        }
        fs.unlinkSync(filePath);
        return res.json({ success: true, message: 'Temp image deleted successfully' });
  },

  // 5. Obtener URL de imagen desde S3
  getImage: async (req, res) => {
        const { fileName } = req.query;
        if (!fileName) return res.status(400).json({ success: false, message: 'Must provide filename.' });

        const url = await bucketService.getFileUrl(fileName);
        if (!url) return res.status(404).json({ success: false, message: 'Image not found.' });

        return res.json({ success: true, url });
  },

  // 6. Eliminar imagen definitiva en S3
  deleteImage: async (req, res) => {
    const key = `visitas/${req.params.fileName}`;
    const deleted = await bucketService.deleteFile(key);

    if (!deleted) return res.status(404).json({ success: false, message: 'Could not delete or not found' });

    return res.json({ success: true, message: 'Image deleted successfully' });
  },

  // 7. Buscar imágenes por fecha
  imagesByDate: async (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'Date is required (yyyyMMdd)' });

    const images = await bucketService.getFilesByKeyword(date);
    if (!images.length) return res.status(404).json({ success: false, message: 'No images found for that date.' });

    return res.json({ success: true, count: images.length, images });
  },

  // 8. Checar cámara (mock)
//   checkCamera: (req, res) => {
//     const cameraOk = rekognitionService.isCameraAvailable();
//     if (!cameraOk) return res.status(503).json({ success: false, message: 'Camera unavailable' });
//     return res.json({ success: true, message: 'Camera available' });
//   },

  // 9. Checar AWS
  checkAWS: async (req, res) => {
    try {
        await rekognitionService.checkAWS();
        return res.json({ success: true, message: 'AWS Rekognition connection successful.' });
    } catch (err) {
        return res.status(503).json({ success: false, message: 'Unable to connect to AWS Rekognition.', error: err.message });
    }
  },

  // 10. Health check
//   healthCheck: async (req, res) => {
//     const cameraOk = rekognitionService.isCameraAvailable();
//     let awsOk = false;
//     let awsMessage = '';

//     try {
//       await rekognitionService.checkAWS();
//       awsOk = true;
//       awsMessage = 'Connection successful';
//     } catch (err) {
//       awsMessage = err.message;
//     }

//     return res.json({ camera_ok: cameraOk, aws_ok: awsOk, aws_message: awsMessage, timestamp: new Date() });
//   }
};
