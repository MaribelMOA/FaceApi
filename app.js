import express from 'express';
import dotenv from 'dotenv';
import faceRoutes from './routes/faceRoutes.js';

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/face', faceRoutes);

app.get('/', (req, res) => {
  res.send('Face API running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Listening on port ${PORT}`);
});
