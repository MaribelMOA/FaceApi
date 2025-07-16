import pool from './db.js';

export const createVisit = async (visitorId, imagePath, type, amount) => {
  const res = await pool.query(
    'INSERT INTO visits (visitor_id, image_path, type, amount) VALUES ($1, $2, $3, $4) RETURNING *',
    [visitorId, imagePath, type, amount]
  );
  return res.rows[0];
};

export const getTotalDailyAmount = async (visitorId) => {
  const res = await pool.query(
    'SELECT SUM(amount) AS total FROM visits WHERE visitor_id = $1 AND created_at >= CURRENT_DATE',
    [visitorId]
  );
  return res.rows[0].total || 0;
};
