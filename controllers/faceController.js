// controllers/faceController.js
const fs = require('fs');
const path = require('path');
const rekognitionService = require('../services/rekognitionService');
const bucketService = require('../services/GCStorageService');
const userModel = require('../models/userModel');
const transactionModel = require('../models/transactionModel');
const { all } = require('../routes/userRoutes');

const TEMP_DIR = path.join(__dirname, '../temp-images');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);

// Cache en memoria: clave = nombre temporal, valor = Buffer de imagen
const imageCache = new Map();


module.exports = {
  // 1. Captura y reconocimiento facial
  identify: async (req, res) => {
        try {
            if (!req.file || !req.file.buffer) {
                return res.status(400).json({ allowed: false, message: 'Image file is required' });
            }
        
            const imageBuffer = req.file.buffer;
    
            // Generar un nombre temporal único para la imagen en memoria
            const tempImageName = `face_${Math.random().toString(36).substring(2, 10)}_${Date.now()}.jpg`;
    
            // Guardar el buffer en la cache en memoria
            imageCache.set(tempImageName, imageBuffer);

            const { faceId, externalImageId, confidence, allowed } = await rekognitionService.recognizeFace(imageBuffer);
            
            if (!faceId || !externalImageId || allowed == false) {
                // Eliminar imagen de cache si no se reconoce
                imageCache.delete(tempImageName);
                
                return res.status(404).json({ success: false, message: `No matching face found with =>99% confidence. Confidence: ${confidence}%` });
            }
          
              // Buscar o crear visitante en la base de datos
            const user = await userModel.getUser(faceId, externalImageId);
          
            return res.json({
                success: true,
                confidence,
                user, // Aquí se retorna el objeto user completo desde la DB
                image_file_path: tempImageName
            });
        } catch (err) {
            console.error('Error in identify:', err);
            return res.status(500).json({ success: false, message: 'Recognition error', error: err.message });
        }
  },

//   // 2. Registrar visita localmente (JSON o DB)
//   registerVisit: async (req, res) => {
//     const { faceId, externalImageId } = req.body;
//     if (!faceId || !externalImageId) return res.status(400).json({ success: false, message: 'Missing data' });

//     await visitModel.register({ faceId, externalImageId });
//     return res.json({ success: true });
//   },

  // 3. Registrar imagen definitiva en un bucket
  registerImage: async (req, res) => {
    try {
        const { userId, tempFileName, realFileName } = req.query;

        if (!userId || !tempFileName || !realFileName) {
            return res.status(400).json({ success: false, message: 'userId, tempFileName, and realFileName are required' });
        }

        // Buscar buffer en cache
        const imageBuffer = imageCache.get(tempImageName);

        if (!imageBuffer) {
            return res.status(404).json({ success: false, message: 'Temp image not found or expired' });
        }

        const finalName = `visitas/${userId}/${realFileName}.jpg`;//_${Date.now()}.jpg`;

        const imageUrl = await bucketService.uploadBuffer(imageBuffer, finalName);
        // Eliminar imagen de cache para liberar memoria
        imageCache.delete(tempImageName);

        return res.json({ success: true, imageUrl });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Image registration failed', error: err.message });
    }
  },

  // 4. Eliminar imagen temporal
  deleteTempImage: (req, res) => {
    const tempFileName = req.params.tempFileName;

    if (!imageCache.has(tempFileName)) {
      return res.status(404).json({ success: false, message: 'Temp image not found in memory' });
    }
  
    imageCache.delete(tempFileName);
  
    return res.json({ success: true, message: 'Temp image deleted successfully from memory' });
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

  /////////////////////////////////////
  getImagesByUserId: async (req, res) => {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });
  
    try {
      const images = await bucketService.getImagesByUserId(userId);
      return res.json({ success: true, count: images.length, images });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Error retrieving images', error: err.message });
    }
  },
  getImagesByRealFileName: async (req, res) => {
    const { realFileName } = req.query;
    if (!realFileName) return res.status(400).json({ success: false, message: 'realFileName is required' });
  
    try {
      const images = await bucketService.getImagesByRealFileName(realFileName);
      return res.json({ success: true, count: images.length, images });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Error retrieving images', error: err.message });
    }
    
      
  },
  getImagesByUserIdAndDate: async (req, res) => {
    const { userId, date } = req.query;
    if (!userId || !date) {
      return res.status(400).json({ success: false, message: 'userId and date are required (YYYY-MM-DD)' });
    }
  
    try {
      const images = await bucketService.getImagesByUserIdAndDate(userId, date);
      return res.json({ success: true, count: images.length, images });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Error retrieving images', error: err.message });
    }
  },
  




    
};
