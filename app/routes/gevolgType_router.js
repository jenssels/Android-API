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

    // Jens Sels - Ophalen van gevolgType where id
    app.get('/gevolgTypes/:id', (req, res) => {
        const id = req.params.id;
        const details = { '_id': new ObjectId(id) };
        db.collection('gevolgType').findOne(details, (err, item) => {
            if (err) {
                res.send({'error':'An error has occurred ' + err});
            } else {
                res.send(item);
            }
        });
    });


    // Jens Sels - Verwijderen van gevolgType where Id
    app.delete('/gevolgTypes/:id', (req, res) => {
        const id = req.params.id;
        const details = { '_id': new ObjectId(id) };
        db.collection('gevolgType').deleteOne(details, (err, item) => {
            if (err) {
                res.send({'error':'An error has occurred ' + err});
            } else {
                res.send({ message: 'GevolgType ' + id + ' deleted!' });
            }
        });
    });

    // Jens Sels - Update een gevolgType
    app.put('/gevolgTypes/:id', (req, res) => {
        const id = req.params.id;
        const details = { '_id': new ObjectId(id) };
        const params = {};
        if (req.body.naam != null){
            params['naam'] = req.body.naam;
        }

        db.collection('gevolgType').updateOne(details, {$set: params}, (err, result) => {
            if (err) {
                res.send({'error':'An error has occurred ' + err});
            } else {
                res.send({ message: 'GevolgType ' + id + ' updated' });
            }
        });
    });


    // Jens Sels - Ophalen van alle overtredingen where
    app.get('/gevolgTypes', (req, res) => {
        db.collection('gevolgType').find({}).toArray((err, items) => {
            if (err) {
                res.send({'error':'An error has occurred ' + err});
            } else {
                res.send(items);
            }
        });
    });

    // Jens Sels - GevolgType toevoegen
    app.post('/gevolgTypes', (req, res) => {
        const overtreding = { naam: req.body.naam  };

        db.collection('gevolgType').insertOne(overtreding, (err, result) => {
            if (err) {
                res.send({ 'error': 'An error has occurred ' + err });
            } else {
                res.send(result.ops[0]);
            }
        });
    });

};
