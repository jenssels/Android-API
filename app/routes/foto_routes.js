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

    // Jens Sels - Ophalen van foto where id
    app.get('/fotos/:id', (req, res) => {
        const id = req.params.id;
        const details = { '_id': new ObjectId(id) };
        db.collection('foto').findOne(details, (err, item) => {
            if (err) {
                res.send({'error':'An error has occurred ' + err});
            } else {
                res.send(item);
            }
        });
    });


    // Jens Sels - Verwijderen van foto where Id
    app.delete('/fotos/:id', (req, res) => {
        const id = req.params.id;
        const details = { '_id': new ObjectId(id) };
        db.collection('foto').deleteOne(details, (err, item) => {
            if (err) {
                res.send({'error':'An error has occurred ' + err});
            } else {
                res.send({ message: 'Foto ' + id + ' deleted!' });
            }
        });
    });

    // Jens Sels - Update een foto
    app.put('/fotos/:id', (req, res) => {
        const id = req.params.id;
        const details = { '_id': new ObjectId(id) };
        const params = {};
        if (req.body.url != null){
            params['url'] = req.body.url;
        }
        if (req.body.overtredingId != null){
            params['overtredingId'] = req.body.overtredingId;
        }

        db.collection('foto').updateOne(details, {$set: params}, (err, result) => {
            if (err) {
                res.send({'error':'An error has occurred ' + err});
            } else {
                res.send({ message: 'Foto ' + id + ' updated' });
            }
        });
    });


    // Jens Sels - Ophalen van alle overtredingen where
    app.get('/fotos', (req, res) => {
        whereParams = {};
        if (req.query.id != null){
            whereParams['overtredingId'] = req.query.id
        }
        db.collection('foto').find(whereParams).toArray((err, items) => {
            if (err) {
                res.send({'error':'An error has occurred ' + err});
            } else {
                res.send(items);
            }
        });
    });

    // Jens Sels - GevolgType toevoegen
    app.post('/fotos', (req, res) => {
        const foto = { url: req.body.url, overtredingId: req.body.overtredingId };

        db.collection('foto').insertOne(foto, (err, result) => {
            if (err) {
                res.send({ 'error': 'An error has occurred ' + err });
            } else {
                res.send(result.ops[0]);
            }
        });
    });

};
