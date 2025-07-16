const db = require('./db');

const exchangeRate = 17.5;

async function saveVisit(visitorId, type, amount, imagePath) {
  await db.query(
    'INSERT INTO visits (visitor_id, type, amount, image_path) VALUES ($1, $2, $3, $4)',
    [visitorId, type, amount, imagePath]
  );
}

async function getTotalDailyAmount(visitorId) {
  const result = await db.query(
    `SELECT type, amount FROM visits 
     WHERE visitor_id = $1 AND DATE(created_at) = CURRENT_DATE`,
    [visitorId]
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

