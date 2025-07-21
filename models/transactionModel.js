const db = require('./db');

const exchangeRate = 17.5;

async function saveTransaction(userId, type, amount, imagePath) {
  await db.query(
    'INSERT INTO transactions (user_id, type, amount, image_path) VALUES ($1, $2, $3, $4)',
    [userId, type, amount, imagePath]
  );
}

async function getTotalDailyAmount(userId) {
  const result = await db.query(
    `SELECT type, amount FROM transactions 
     WHERE user_id = $1 AND DATE(created_at) = CURRENT_DATE`,
    [userId]
  );

  let total = 0;
  result.rows.forEach(row => {
    if (row.type === 'compra') {
      total += parseFloat(row.amount);
    } else if (row.type === 'venta') {
      total += parseFloat(row.amount) / exchangeRate;
    }
  });

  return total;
}

async function getTransactions(userId = null) {
  const result = userId
    ? await db.query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC', [userId])
    : await db.query('SELECT * FROM transactions ORDER BY created_at DESC');

  return result.rows;
}

async function getTransactionById(id) {
  const result = await db.query('SELECT * FROM transactions WHERE id = $1', [id]);
  return result.rows[0];
}

async function updateTransaction(id, fieldsToUpdate) {
  const allowedFields = ['image_path', 'type', 'amount'];
  const keys = Object.keys(fieldsToUpdate).filter(key => allowedFields.includes(key));

  if (keys.length === 0) return null; // Nada para actualizar

  const setClauses = keys.map((key, idx) => `${key} = $${idx + 1}`);
  const values = keys.map(key => fieldsToUpdate[key]);

  const query = `
    UPDATE transactions
    SET ${setClauses.join(', ')}
    WHERE id = $${keys.length + 1}
    RETURNING *`;

  const result = await db.query(query, [...values, id]);
  return result.rows[0];
}


async function deleteTransaction(id) {
  const result = await db.query('DELETE FROM transactions WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
}

module.exports = {
  saveTransaction,
  getTotalDailyAmount,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};

