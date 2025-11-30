const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const app = express();

app.use(express.json());

let db;

MongoClient.connect('mongodb+srv://mindhadi5_db_user:Password@cluster0.289bhfc.mongodb.net', (err, client) => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    db = client.db('webstore');
    console.log('Connected to MongoDB');
});

app.get('/', (req, res) => {
    res.send('Welcome to the webstore API');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});