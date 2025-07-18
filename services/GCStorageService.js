// services/gcStorageService.js
const { Storage } = require('@google-cloud/storage');
const { URL } = require('url');

const bucketName = process.env.BUCKET_GC;

const privateKey = process.env.GC_PRIVATE_KEY?.replace(/\\n/g, '\n');

const credentials = {
  type: 'service_account',
  project_id: process.env.GC_PROJECT_ID,
  private_key_id: process.env.GC_PRIVATE_KEY_ID,
  private_key: privateKey,
  client_email: process.env.GC_CLIENT_EMAIL,
  client_id: process.env.GC_CLIENT_ID,
  client_x509_cert_url: process.env.GC_CLIENT_CERT_URL
};

const storage = new Storage({ credentials });

const bucket = storage.bucket(bucketName);

module.exports = {
  async uploadFile(localPath, destFileName) {
    await bucket.upload(localPath, {
      destination: destFileName,
      public: false
    });
    return destFileName;
  },

  async getSignedUrl(fileName) {
    const file = bucket.file(fileName);

    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000, // 1 hora
    });

    return url;
  },

  async deleteFile(fileName) {
    try {
      await bucket.file(fileName).delete();
      return true;
    } catch (err) {
      if (err.code === 404) {
        console.log('Archivo no encontrado:', fileName);
        return false;
      }
      console.error('Error al eliminar archivo:', err);
      return false;
    }
  },

  async findFileByPrefix(prefix) {
    const [files] = await bucket.getFiles({ prefix: 'visitas/' });

    const match = files
      .filter(f => f.name.includes(prefix) && f.name.endsWith('.jpg'))
      .sort((a, b) => new Date(b.metadata.updated) - new Date(a.metadata.updated))[0];

    return match?.name || null;
  },

  async  getImagesByUserId(userId) {
    const [files] = await bucket.getFiles({ prefix: `visitas/${userId}/` });
    const urls = [];
  
    for (const file of files) {
      if (file.name.endsWith('.jpg')) {
        const [url] = await file.getSignedUrl({
          version: 'v4',
          action: 'read',
          expires: Date.now() + 60 * 60 * 1000
        });
        urls.push(url);
      }
    }
  
    return urls;
  },  

  async  getImagesByRealFileName(realFileName) {
    const [files] = await bucket.getFiles({ prefix: `visitas/` });
    const urls = [];
  
    for (const file of files) {
      if (file.name.includes(`/${realFileName}_`) && file.name.endsWith('.jpg')) {
        const [url] = await file.getSignedUrl({
          version: 'v4',
          action: 'read',
          expires: Date.now() + 60 * 60 * 1000
        });
        urls.push(url);
      }
    }
  
    return urls;
  },

  async  getImagesByUserIdAndDate(userId, dateStr) {
    const [files] = await bucket.getFiles({ prefix: `visitas/${userId}/` });
    const urls = [];
  
    for (const file of files) {
      const metadataDate = dayjs(file.metadata.updated).format('YYYY-MM-DD');
      if (metadataDate === dateStr) {
        const [url] = await file.getSignedUrl({
          version: 'v4',
          action: 'read',
          expires: Date.now() + 60 * 60 * 1000
        });
        urls.push(url);
      }
    }
  
    return urls;
  }
  

  
  

//   async getFilesByKeyword(keyword) {
//     const [files] = await bucket.getFiles({ prefix: 'visitas/' });
//     const signedUrls = [];

//     for (const file of files) {
//       if (file.name.includes(keyword)) {
//         const [url] = await file.getSignedUrl({
//           version: 'v4',
//           action: 'read',
//           expires: Date.now() + 60 * 60 * 1000
//         });
//         signedUrls.push(url);
//       }
//     }

//     return signedUrls;
//   }
};