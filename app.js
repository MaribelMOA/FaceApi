const express = require('express');
const app = express();
require('dotenv').config();

app.use(express.json());

const visitorRoutes = require('./routes/visitorRoutes');
const visitRoutes = require('./routes/visitRoutes');
const faceRoutes = require('./routes/faceRoutes');

app.use('/api/visitors', visitorRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/face', faceRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));


// import express from 'express';
// import dotenv from 'dotenv';
// import faceRoutes from './routes/faceRoutes.js';

// dotenv.config();
// const app = express();

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use('/api/face', faceRoutes);

// app.get('/', (req, res) => {
//   res.send('Face API running');
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`✅ Listening on port ${PORT}`);
// });
