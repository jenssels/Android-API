const ObjectId       = require('mongodb').ObjectID;
const config         = require('../../config/config');
const jwt            = require('jsonwebtoken');

// Jens Sels - Middleware die checkt of er een valid token is meegegeven
const loginGuard = function(req, res, next) {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({ message: 'No token provided.' });

    jwt.verify(token, config.secret, function(err, decoded) {
        if (err) return res.status(500).send({message: 'Failed to authenticate token.'});
    });
    next();
};

// Jens Sels - Middleware die checkt of de token valid is en dat de gebruiker een admin is
const adminGuard = function(req, res, next) {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({ message: 'No token provided.' });

    jwt.verify(token, config.secret, function(err, decoded) {
        if (err) return res.status(500).send({message: 'Failed to authenticate token.'});
        if (parseInt(decoded.adminNiveau) < 1) {
            return res.status(403).send({message: 'Access denied, permission not high enough.'});
        }
        else{
            next();
        }
    });
};

module.exports = function(app, db) {

    // Jens Sels - Ophalen van overtreding where id
    app.get('/overtredingen/:id', (req, res) => {
        const id = req.params.id;
        const details = { '_id': new ObjectId(id) };
        db.collection('overtreding').findOne(details, (err, item) => {
            if (err) {
                res.send({'error':'An error has occurred ' + err});
            } else {
                res.send(item);
            }
        });
    });


    // Jens Sels - Verwijderen van overtreding where Id
    app.delete('/overtredingen/:id', (req, res) => {
        const id = req.params.id;
        const details = { '_id': new ObjectId(id) };
        db.collection('overtreding').deleteOne(details, (err, item) => {
            if (err) {
                res.send({'error':'An error has occurred ' + err});
            } else {
                res.send({ message: 'Overtreding ' + id + ' deleted!' });
            }
        });
    });

    // Jens Sels - Update een overtreding
    app.put('/overtredingen/:id', (req, res) => {
        const id = req.params.id;
        const details = { '_id': new ObjectId(id) };
        const params = {};
        if (req.body.datum != null){
            params['datum'] = req.body.datum;
        }
        if (req.body.nummerplaat != null){
            params['nummerplaat'] = req.body.nummerplaat;
        }
        if (req.body.nummerplaatUrl != null){
            params['nummerplaatUrl'] = req.body.nummerplaatUrl;
        }
        if (req.body.lengtegraad != null){
            params['lengtegraad'] = req.body.lengtegraad;
        }
        if (req.body.breedtegraad != null){
            params['breedtegraad'] = req.body.breedtegraad;
        }
        if (req.body.opmerking != null){
            params['opmerking'] = req.body.opmerking;
        }
        if (req.body.parkeerwachterId != null){
            params['parkeerwachterId'] = req.body.parkeerwachterId;
        }
        if (req.body.gevolgTypeId != null){
            params['gevolgTypeId'] = req.body.gevolgTypeId;
        }

        db.collection('overtreding').updateOne(details, {$set: params}, (err, result) => {
            if (err) {
                res.send({'error':'An error has occurred ' + err});
            } else {
                res.send({ message: 'Overtreding ' + id + ' updated' });
            }
        });
    });


    // Jens Sels - Ophalen van alle overtredingen where
    app.get('/overtredingen', (req, res) => {
        const whereParams = {};
        const sortParams = {};
        if (req.query.where != null && req.query.whereValue != null){
            whereParams[req.query.where] =  req.query.whereValue;
        }
        if (req.query.sort != null && req.query.sortRichting != null){
            let richting = -1;
            if (sortRichting === "ASC"){
                richting = 1;
            }
            sortParams[req.query.sort] =  richting;
        }

        db.collection('overtreding').find(whereParams).sort(sortParams).toArray((err, items) => {
            if (err) {
                res.send({'error':'An error has occurred ' + err});
            } else {
                res.send(items);
            }
        });
    });

    // Jens Sels - Overtreding toevoegen
    app.post('/overtredingen', (req, res) => {
        const overtreding = { datum: req.body.datum, nummerplaat: req.body.nummerplaat, nummerplaatUrl: req.body.nummerplaatUrl, breedtegraad: req.body.breedtegraad, lengtegraad: req.body.lengtegraad, opmerking: req.body.opmerking, parkeerwachterId: req.body.parkeerwachterId, gevolgTypeId: req.body.gevolgTypeId  };

        db.collection('overtreding').insertOne(overtreding, (err, result) => {
            if (err) {
                res.send({ 'error': 'An error has occurred ' + err });
            } else {
                res.send(result.ops[0]);
            }
        });
    });

};
