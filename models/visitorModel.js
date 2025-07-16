const db = require('./db');

async function getVisitor(faceId, externalImageId) {
  const result = await db.query(
    'SELECT * FROM visitors WHERE face_id = $1 AND external_image_id = $2',
    [faceId, externalImageId]
  );
  if (result.rows.length > 0) return result.rows[0];

  const insert = await db.query(
    'INSERT INTO visitors (face_id, external_image_id) VALUES ($1, $2) RETURNING *',
    [faceId, externalImageId]
  );
  return insert.rows[0];
}

module.exports = {
  getVisitor
};
