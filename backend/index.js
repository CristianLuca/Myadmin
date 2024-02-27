

const express = require('express');
const mysql = require('mysql')
const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json())

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password:   "admin",
    database: "ilcapitanos"
})
app.get('/', (req, res) => {
    return res.json("from backend");
})


app.get('/booking', (req, res) => {
    const { date } = req.query;
    // Query to fetch bookings for the given date
    const sql = 'SELECT * FROM booking WHERE date = ?';
    // Execute query with the selected date
    db.query(sql, [date], (error, results) => {
      if (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
      res.json(results);
    });
  });
  app.post('/addbooking', (req, res) => {
    const sql = 'INSERT INTO booking (`first_name`, `last_name`, `email`, `phone`, `no_guests`, `date`, `time`, `message`) VALUES (?)';
    const values = [
        req.body.first_name,
        req.body.last_name,
        req.body.email,
        req.body.phone,
        req.body.no_guests,
        req.body.date,
        req.body.time,
        req.body.message
    ];
    db.query(sql, [values], (err, data) => {
        if (err) {
            return res.json(err);
        }
        return res.json(data);
    })
})
app.listen(8800, () => {
    console.log("Server is running on port 8800");
})