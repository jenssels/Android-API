// routes/index.js
const parkeerwachterRoutes = require('./parkeerwachter_routes');
const overtedingRoutes = require('./overtreding_routes');
const gevolgTypeRoutes = require('./gevolgType_router');
const fotoRoutes = require('./foto_routes');
module.exports = function(app, db) {
    parkeerwachterRoutes(app, db);
    overtedingRoutes(app,db);
    gevolgTypeRoutes(app,db);
    fotoRoutes(app,db);
};