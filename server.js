const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const ObjectID= require('mongodb').ObjectID;
 
app.use(express.json()); 
app.use((req, res, next)=>{ // CORS HEADERS MIDDLEWARE
    res.setHeader('Access-Control-Allow-Origin', '*') // Allow all origins
    res.setHeader('Access-Control-Allow-Credentials', 'true') 
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT'); // Allow these methods
    res.setHeader('Access-Control-Allow-Headers', "Access-Control-Allow-Headers, Origin ,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
 
    next();
 
});
const path = require('path'); // file and directory path utilities
const fs = require('fs'); // file system module


 
let db;
 
MongoClient.connect('mongodb+srv://mindhadi5_db_user:Password@cluster0.289bhfc.mongodb.net/', (err, client)=>{
    db=client.db('webstore');
});
 
app.use(function(req, res, next) { // LOGGING MIDDLEWARE
    console.log("Request IP: " + req.url); // Log the request URL
    console.log("Request date: " + new Date()); // Log the request date and time
    next();
});

// STATIC FILE MIDDLEWARE FOR IMAGES
app.get('/images/:imageName', (req, res) => {
    const imageName = req.params.imageName;

  // Construct the full path to the image
    const imagePath = path.join(__dirname, "images", imageName);

    // Check if the file exists
    fs.access(imagePath, fs.constants.F_OK, err => {
        if (err) {
            return res.status(404).json({
                error: `Image "${imageName}" not found`
            });
        }
    // Send the image file
        res.sendFile(imagePath);
    });
});

// default route
app.get('/', (req, res, next)=>{ // 
    res.send('Select a collection, e.g., /collection/messages')
});
 
// middleware to extract collection name from the URL
app.param('collectionName', (req, res, next, collectionName)=>{
    req.collection = db.collection(collectionName)
    return next();
});
 
//retrieve all the objects from a collection
app.get('/collection/:collectionName', (req, res,next)=>{
    req.collection.find({}).toArray((e, results)=>{
        if (e) return next(e)
 
            res.send(results)
    })
});

app.post('/collection/:collectionName', (req, res, next)=>{
    req.collection.insertOne(req.body, (e, result)=>{  // insertOne for single document
        if (e) return next(e)   
        res.send(result.ops || [result])  // Handle both old and new driver formats
    })
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
            { subject: { $regex: searchQuery, $options: 'i' } },// partial matching, Case-insensitive search
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

// retrieve a single document by id
app.get('/collection/:collectionName/:id', (req, res, next)=>{
    req.collection.findOne({_id: new ObjectID(req.params.id)}, (e, result)=>{
        if (e) return next(e)
        res.send(result)
    })
});

// update a document
app.put('/collection/:collectionName/:id', (req, res, next)=>{
    req.collection.updateOne(
        {_id: new ObjectID(req.params.id)},
        {$set: req.body},
        (e, result)=>{
            if (e) return next(e)
            res.send((result.modifiedCount === 1) ? {msg: 'success'} : {msg: 'error'})
        }
    )
});

// delete a document
app.delete('/collection/:collectionName/:id', (req, res, next) => { // DELETE DOCUMENT BY ID
    req.collection.deleteOne( {_id: ObjectID(req.params.id)},
       (e, result) => { if (e) return next(e) 
        res.send((result.result.n === 1) ? {msg: 'success'} : {msg: 'error'}) }) })
 

        // start the server
const port = process.env.PORT || 3000;// process.env.PORT for production environment
app.listen(port,()=>{
    console.log("Express.js server running at localhost:3000")
})