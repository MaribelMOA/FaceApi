const db = require('./db');

async function getUser(faceId, externalImageId) {
  const result = await db.query(
    'SELECT * FROM users WHERE face_id = $1 AND external_image_id = $2',
    [faceId, externalImageId]
  );
  if (result.rows.length > 0) return result.rows[0];

  const insert = await db.query(
    'INSERT INTO users (face_id, external_image_id) VALUES ($1, $2) RETURNING *',
    [faceId, externalImageId]
  );
  return insert.rows[0];
}
async function getUserById(id) {
  const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

async function getAllUsers() {
  const result = await db.query('SELECT * FROM users ORDER BY created_at DESC');
  return result.rows;
}

async function createUser(faceId, externalImageId) {
  const result = await db.query(
    'INSERT INTO users (face_id, external_image_id) VALUES ($1, $2) RETURNING *',
    [faceId, externalImageId]
  );
  return result.rows[0];
}

// async function updateUser(id, faceId, externalImageId) {
//   const result = await db.query(
//     `UPDATE users 
//      SET face_id = $1, external_image_id = $2 
//      WHERE id = $3 RETURNING *`,
//     [faceId, externalImageId, id]
//   );
//   return result.rows[0];
// }

async function updateUser(id, fields) {
  const columns = [];
  const values = [];
  let index = 1;

  // Construye dinámicamente los campos a actualizar
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      columns.push(`${key === 'faceId' ? 'face_id' : 'external_image_id'} = $${index}`);
      values.push(value);
      index++;
    }
  }

  if (columns.length === 0) return null;

  const query = `
    UPDATE users
    SET ${columns.join(', ')}
    WHERE id = $${index}
    RETURNING *;
  `;
  values.push(id);

  const result = await db.query(query, values);
  return result.rows[0] || null;
}

async function deleteUser(id) {
  const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
}

module.exports = {
  getUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser
};
