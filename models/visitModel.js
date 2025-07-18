const db = require('./db');

const exchangeRate = 17.5;

async function saveVisit(userId, type, amount, imagePath) {
  await db.query(
    'INSERT INTO visits (user_id, type, amount, image_path) VALUES ($1, $2, $3, $4)',
    [userId, type, amount, imagePath]
  );
}

async function getTotalDailyAmount(userId) {
  const result = await db.query(
    `SELECT type, amount FROM visits 
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

module.exports = {
  saveVisit,
  getTotalDailyAmount
};

