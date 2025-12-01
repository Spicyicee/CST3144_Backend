const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
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

app.use((req, res, next) => {
    console.log('Request IP:', req.url);
    console.log('Request date:', new Date());
    next();
});

app.get('/', (req, res) => {
    res.send('Select a collection, e.g., /collection/messages');
});

app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);
    return next();
});

app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e);
        res.send(results);
    });
});

app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insert(req.body, (e, results) => {
        if (e) return next(e);
        res.send(results.ops);
    });
});

app.get('/collection/:collectionName/search/:query', (req, res, next) => {
    const searchQuery = req.params.query;
    
    console.log('=================================');
    console.log('SEARCH REQUEST RECEIVED');
    console.log('Collection:', req.params.collectionName);
    console.log('Search Query:', searchQuery);
    console.log('Timestamp:', new Date().toLocaleString());
    console.log('=================================');
    
    const filter = {
        $or: [
            { subject: { $regex: searchQuery, $options: 'i' } },
            { location: { $regex: searchQuery, $options: 'i' } }
        ]
    };
    
    req.collection.find(filter).toArray((e, results) => {
        if (e) {
            console.error('Search Error:', e);
            return next(e);
        }
        
        console.log(`Found ${results.length} result(s)`);
        if (results.length > 0) {
            console.log('Results:');
            results.forEach((result, index) => {
                console.log(`  ${index + 1}. ${result.subject} - ${result.location}`);
            });
        } else {
            console.log('No results found');
        }
        console.log('=================================\n');
        
        res.send(results);
    });
});

app.get('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.findOne({_id: new ObjectID(req.params.id)}, (e, result) => {
        if (e) return next(e);
        res.send(result);
    });
});

app.put('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.update(
        {_id: new ObjectID(req.params.id)},
        {$set: req.body},
        {safe: true, multi: false},
        (e, result) => {
            if (e) return next(e);
            res.send((result.result.n === 1) ? {msg: 'success'} : {msg: 'error'});
        }
    );
});


app.delete('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.deleteOne(
        {_id: new ObjectID(req.params.id)},
        (e, result) => {
            if (e) return next(e);
            res.send((result.result.n === 1) ? {msg: 'success'} : {msg: 'error'});
        }
    );
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});