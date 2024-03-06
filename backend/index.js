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

// Fetch all stocks
app.get('/stock', (req, res) => {
  const sql = 'SELECT * FROM stock';
  db.query(sql, (error, results) => {
    if (error) {
      console.error('Error fetching stocks:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json(results);
  });
});

// Add a new stock
app.post('/addstock', (req, res) => {
  const { product_name, expiry_date, quantity_left, unit, kg_unit, stock_level } = req.body;
  const sql = 'INSERT INTO stock (product_name, expiry_date, quantity_left, unit, kg_unit, stock_level) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [product_name, expiry_date, quantity_left, unit, kg_unit, stock_level];
  db.query(sql, values, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json({ message: 'Stock added successfully' });
  });
});

// Update existing stock
app.put('/updatestock/:id', (req, res) => {
  const stockId = req.params.id;
  const { product_name, expiry_date, quantity_left, unit, kg_unit, stock_level } = req.body;
  const sql = 'UPDATE stock SET product_name=?, expiry_date=?, quantity_left=?, unit=?, kg_unit=?, stock_level=? WHERE id=?';
  const values = [product_name, expiry_date, quantity_left, unit, kg_unit, stock_level, stockId];
  db.query(sql, values, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json({ message: 'Stock updated successfully' });
  });
});

// Delete a stock
app.delete('/deletestock/:id', (req, res) => {
  const stockId = req.params.id;
  const sql = 'DELETE FROM stock WHERE id = ?';
  db.query(sql, [stockId], (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json({ message: 'Stock deleted successfully' });
  });
});
app.get('/tables', (req, res) => {
  const sql = 'SELECT * FROM tables';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching tables:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    // Parse the position from JSON string to object for each table
    const tablesWithParsedPosition = result.map((table) => {
      return {
        ...table,
        position: JSON.parse(table.position),
      };
    });

    res.json(tablesWithParsedPosition);
  });
});


app.post('/tables', (req, res) => {
  const { name, position } = req.body;
  const sql = 'INSERT INTO tables (name, position) VALUES (?, ?)';
  const values = [name, JSON.stringify(position)];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error adding table:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    const insertedTable = { id: result.insertId, name, position };
    res.json(insertedTable);
  });
});
app.put('/tables/:id', (req, res) => {
  const tableId = req.params.id;
  const { position } = req.body;
  const sql = 'UPDATE tables SET position=? WHERE id=?';
  const values = [JSON.stringify(position), tableId];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error updating table position:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    res.json({ message: 'Table position updated successfully' });
  });
});
app.listen(8800, () => {
  console.log("Server is running on port 8800");
});
