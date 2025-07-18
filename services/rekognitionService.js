// services/rekognitionService.js
const AWS = require('aws-sdk');
// const fs = require('fs');
// const { spawn } = require('child_process');
const crypto = require('crypto');

const rekognition = new AWS.Rekognition({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const COLLECTION_ID = 'mi-coleccion-facial';

 module.exports = {
//   // 1. Simula captura de cámara (reemplaza con integración real si la tienes)
//   captureFace: async () => {
//     return new Promise((resolve, reject) => {
//       const simulatedImagePath = './sample-face.jpg';

//       if (!fs.existsSync(simulatedImagePath)) {
//         return resolve({ success: false, message: 'No se encontró imagen simulada.' });
//       }

//       const imageBuffer = fs.readFileSync(simulatedImagePath);
//       resolve({ success: true, imageBuffer });
//     });
//   },

  // 2. Llama a AWS Rekognition para identificar o registrar
  recognizeFace: async (imageBuffer) => {
    const searchParams = {
      CollectionId: COLLECTION_ID,
      Image: { Bytes: imageBuffer },
      FaceMatchThreshold: 99,//Originalmente 85
      MaxFaces: 1
    };

    try {
      const search = await rekognition.searchFacesByImage(searchParams).promise();

      if (search.FaceMatches.length > 0) {
        const matchData = search.FaceMatches[0];
        const match = matchData.Face;
        const similarity = matchData.Similarity;

        //const match = search.FaceMatches[0].Face;
        
        if (similarity >= 99) {
            return {
              faceId: match.FaceId,
              externalImageId: match.ExternalImageId,
              confidence: similarity,
              allowed: true
            };
          } else {
            return {
              faceId: null,
              externalImageId: null,
              confidence: similarity,
              allowed: false
            };
          }

          //OG
        // return { 
        //     faceId: match.FaceId, 
        //     externalImageId: match.ExternalImageId };

        
      } else {
        // Indexar nuevo rostro con ID 
        //const externalId = 'Unknown-' + Math.random().toString(36).substring(2, 10);

        const externalId = 'Unknown-' + crypto.randomUUID();
        const index = await rekognition.indexFaces({
          CollectionId: COLLECTION_ID,
          Image: { Bytes: imageBuffer },
          ExternalImageId: externalId
        }).promise();

        const faceId = index.FaceRecords[0]?.Face?.FaceId || null;
        return { faceId, 
            externalImageId: externalId, 
            confidence: 100,
            allowed: true
        };
      }
    } catch (err) {
        console.error('Error en Rekognition:', err);
        throw err;
    }
  },

//   isCameraAvailable: () => {
//     // Puedes reemplazar esto por una validación real de tu cámara en Linux/Mac
//     return true;
//   },

  checkAWS: async () => {
    await rekognition.listCollections({}).promise();
  }
};
