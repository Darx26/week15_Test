//Import dependencies modules
const express = require('express')
//const bodyParser = require('body-parser)

//Create an Express.js instance:
const app = express ()

//config Express.js
app.use(express.json())
app.set('port',3000)
app.use((req,res,next) =>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    
    next();
})

//connect to MongoDB
const MongoClient = require('mongodb').MongoClient;

let db;

MongoClient.connect('mongodb+srv://haydenfdes:hayden26@cluster0.biskd8a.mongodb.net', (err, client) => {
    db = client.db('webstore')
})

//display a message for root path to show that API is working
app.get('/', (req,res,next) => {
    res.send('Select a collection, e.g., /collection/messages')
})

//get the collection name
app.param('collectionName', (req,res, next, collectionName) => {
    req.collection = db.collection(collectionName)
    //console.log('collection name:', req.collection)
    return next()
})

//retrieve all the objects from a collection
app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((err,results) => {
        if (err) return next(err)
        res.send(results)
    })
})

//post object into collection
app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insert(req.body, (err,results) => {
        if (err) return next(err)
        res.send(results.ops) //to send unique id
    })
})

const ObjectID = require('mongodb').ObjectID
app.get('/collection/:collectionName/:id', (req,res, next) =>{
    req.collection.findOne({_id: new ObjectID(req.params.id) }, (err,result) => {
        if (err) return next(err)
        res.send(result)
    })
})

//to update records
app.put('/collection/:collectionName/:id', (req,res,next) => {
    req.collection.update(
        {_id: new ObjectID(req.params.id)},
        {$set: req.body},
        {safe: true, multi: false}, //to update only once the code is fully executed safely without errors
        (err, result) => {
            if (err) return next(err)
             res.send((result.result.n === 1) ? {msg: 'success'} : {msg: 'error'})
        }
    )
})

//to delete records
app.delete('/collection/:collectionName/:id', (req,res,next) => {
    req.collection.deleteOne(
        {_id: ObjectID(req.params.id)}, (err, result) => {
            if (err) return next(err)
            res.send((result.result.n ===1) ? {msg: 'success'} : {msg: 'error'})
        }
    )
})

// app.listen(3000, () => {
//     console.log('Express.js server running at localhost:3000')
// })

const port = process.env.PORT || 3000
app.listen(port)