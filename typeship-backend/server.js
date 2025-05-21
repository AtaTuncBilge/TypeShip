const express = require('express');
const sql = require('mssql/msnodesqlv8');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const config = {
  connectionString: "Driver={ODBC Driver 17 for SQL Server};Server=localhost,5000;Database=typeship_db;Trusted_Connection=Yes;"
};

// Skor ekleme
app.post('/results', async (req, res) => {
  const { name, time, wpm, accuracy } = req.body;
  console.log("POST edilen skor:", req.body);

  // Eksik veri kontrolü
  if (!name || time == null || wpm == null || accuracy == null) {
    return res.status(400).json({ error: 'Eksik veri' });
  }

  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('name', sql.NVarChar, name)
      .input('time', sql.Float, time)
      .input('wpm', sql.Float, wpm)
      .input('accuracy', sql.Float, accuracy)
      .query(`
        INSERT INTO results (name, time, wpm, accuracy) VALUES (@name, @time, @wpm, @accuracy)
      `);

    // Ekledikten sonra son durumu dön
    const result = await pool.request().query('SELECT * FROM results ORDER BY created_at DESC');
    res.json(result.recordset);

  } catch (err) {
    console.error("INSERT HATASI:", err);
    res.status(500).json({ error: err.message });
  }
});

// Leaderboard (tüm skorlar)
app.get('/results', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM results ORDER BY created_at DESC');
    res.json(result.recordset);
  } catch (err) {
    console.error("GET HATASI:", err);
    res.status(500).json({ error: err.message });
  }
});

// Server başlat
app.listen(3001, () => {
  console.log('Server started: http://localhost:3001');
});
