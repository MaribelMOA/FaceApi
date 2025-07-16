import pool from './db.js';

export const createVisitor = async (faceId, externalImageId) => {
  const res = await pool.query(
    'INSERT INTO visitors (face_id, external_image_id) VALUES ($1, $2) RETURNING *',
    [faceId, externalImageId]
  );
  return res.rows[0];
};
