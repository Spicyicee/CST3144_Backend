const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const app = express();

app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
    next();
});

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
    res.send('Select a collection, e.g., /collection/messages');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});