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


    app.post('/parkeerwachters/login', (req, res) => {
        const username = req.body.username;
        const pincode = req.body.pincode;

        const details = {'username': username, 'pincode': pincode};

        db.collection('parkeerwachter').findOne(details, (err, item) => {
            if (err) {
                res.send({'error':'An error has occurred ' + err});
            } else {
                if (item != null){
                    const token = jwt.sign({ id: item._id, username: item.username }, config.secret, {
                        expiresIn: 86400
                    });
                    res.send({token: token, user: item});
                }
                else{
                    res.send({user: item})
                }
            }
        });
    });



    // Jens Sels - Ophalen van parkeerwachter where id
    app.get('/parkeerwachters/:id', (req, res) => {
        const id = req.params.id;
        const details = { '_id': new ObjectId(id) };
        db.collection('parkeerwachter').findOne(details, (err, item) => {
            if (err) {
                res.send({'error':'An error has occurred ' + err});
            } else {
                res.send(item);
            }
        });
    });


    // Jens Sels - Verwijderen van parkeerwachter where Id
    app.delete('/parkeerwachters/:id', (req, res) => {
        const id = req.params.id;
        const details = { '_id': new ObjectId(id) };
        db.collection('parkeerwachter').deleteOne(details, (err, item) => {
            if (err) {
                res.send({'error':'An error has occurred ' + err});
            } else {
                res.send({ message: 'Parkeerwachter ' + id + ' deleted!' });
            }
        });
    });

    // Jens Sels - Update een parkeerwachter
    app.put('/parkeerwachters/:id', (req, res) => {
        const id = req.params.id;
        const details = { '_id': new ObjectId(id) };
        const params = {};
        if (req.body.username != null){
            params['username'] = req.body.username;
        }
        if (req.body.pincode != null){
            params['pincode'] = req.body.pincode;
        }
        if (req.body.voornaam != null){
            params['voornaam'] = req.body.voornaam;
        }
        if (req.body.naam != null){
            params['naam'] = req.body.naam;
        }

        db.collection('parkeerwachter').updateOne(details, {$set: params}, (err, result) => {
            if (err) {
                res.send({'error':'An error has occurred ' + err});
            } else {
                res.send({ message: 'Parkeerwachter ' + id + ' updated' });
            }
        });
    });


    // Jens Sels - Ophalen van alle parkeerwachters
    app.get('/parkeerwachters/', (req, res) => {
        db.collection('parkeerwachter').find({}).toArray((err, items) => {
            if (err) {
                res.send({'error':'An error has occurred ' + err});
            } else {
                res.send(items);
            }
        });
    });

    // Jens Sels - User toevoegen
    app.post('/parkeerwachters', (req, res) => {
        const user = { username: req.body.username, pincode: req.body.pincode, voornaam: req.body.voornaam, naam: req.body.naam };

        db.collection('parkeerwachter').insertOne(user, (err, result) => {
            if (err) {
                res.send({ 'error': 'An error has occurred ' + err });
            } else {
                res.send(result.ops[0]);
            }
        });
    });

};
