const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "admin",
  database: "ilcapitanos"
});

app.get('/', (req, res) => {
  return res.json("from backend");
});

app.get('/booking', (req, res) => {
  const { date } = req.query;
  // Query to fetch bookings for the given date
  const sql = 'SELECT * FROM booking';
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
app.get('/staff', (req, res) => {
  const { date } = req.query;
  // Query to fetch bookings for the given date
  const sql = 'SELECT * FROM staff';
  // Execute query with the selected date
  db.query(sql, [date], (error, results) => {
    if (error) {
      console.error('Error fetching staff info:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json(results);
  });
});

app.post('/addbooking', (req, res) => {
  const { first_name, last_name, email, phone, no_guests, date, time, message } = req.body;
  const sql = 'INSERT INTO booking (first_name, last_name, email, phone, no_guests, date, time, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [first_name, last_name, email, phone, no_guests, date, time, message];
  db.query(sql, values, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json({ message: 'Booking added successfully' });
  });
});
app.post('/addstaff', (req, res) => {
  const { first_name, last_name, initials, role, payrate} = req.body;
  const sql = 'INSERT INTO staff (first_name, last_name, initials, role, payrate) VALUES (?, ?, ?, ?, ?)';
  const values = [first_name, last_name, initials, role, payrate];
  db.query(sql, values, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json({ message: 'Staff member added successfully' });
  });
});
app.post('/assign-employees', async (req, res) => {
  try {
    const { date, employees } = req.body;

    // Check for empty employee list
    if (!employees.length) {
      res.status(400).json({ error: 'Please select at least one employee' });
      return;
    }


    const insertValues = employees.map((employeeId) => [date, employeeId]);
    const insertQuery = 'INSERT INTO assigned_staff (date, employee_id) VALUES ?';
    await db.query(insertQuery, [insertValues]);

    res.json({ message: 'Employees assigned successfully' });
  } catch (error) {
    console.error('Error assigning employees:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/assigned-staff', async (req, res) => {
  try {
    const { date } = req.query;

    // Query to fetch assigned staff for the given date
    const sql = 'SELECT assigned_staff.*, staff.initials FROM assigned_staff JOIN staff ON assigned_staff.employee_id = staff.id WHERE assigned_staff.date = ? ';
   
    // Execute the query with the selected date
    db.query(sql, [date], (error, results) => {
      if (error) {
        console.error('Error fetching assigned staff:', error);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
      res.json(results);
    });
  } catch (error) {
    console.error('Error fetching assigned staff:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.put('/updatebooking/:id', (req, res) => {
  const bookingId = req.params.id;
  const { first_name, last_name, email, phone, no_guests, date, time, message } = req.body;
  const sql = 'UPDATE booking SET first_name=?, last_name=?, email=?, phone=?, no_guests=?, date=?, time=?, message=? WHERE id=?';
  const values = [first_name, last_name, email, phone, no_guests, date, time, message, bookingId];
  db.query(sql, values, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json({ message: 'Booking updated successfully' });
  });
});

app.delete('/deletebooking/:id', (req, res) => {
  const bookingId = req.params.id;
  const sql = 'DELETE FROM booking WHERE id = ?';
  db.query(sql, [bookingId], (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json({ message: 'Booking deleted successfully' });
  });
});

app.listen(8800, () => {
  console.log("Server is running on port 8800");
});
