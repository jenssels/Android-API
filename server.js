// server.js

const express        = require('express');
const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
const app            = express();
const config         = require('./config/config');

const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT, POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    } else{
        next();
    }
};

const port = 8080;

app.use(bodyParser.urlencoded({ extended: true }));

const connectToMongo = async() => {
    let client = await MongoClient.connect(config.url,{server: {
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 1000
    }, useNewUrlParser: true });

    let db = await client.db('android-api');

    app.use(allowCrossDomain);

    require('./app/routes')(app, db);

    await app.listen(port, () => {
        console.log('We are live on ' + port);
    });
};

connectToMongo();

