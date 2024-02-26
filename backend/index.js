

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
    const q = "SELECT * FROM booking";
    db.query(q, (err, data) => {
        if (err) {
            return res.json('err');
        }
        return res.json(data);
    })
})
app.listen(8800, () => {
    console.log("Server is running on port 8800");
})