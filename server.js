var express = require('express'),
     app = express(),
     port = 8000;
var path = require('path');
// Config file
var config = require('./config.json');


// Use mongojs to handle MongoDB things.
// db to use mongojs like mongo command line
var mongojs = require('mongojs'),
    db = {
        update: mongojs(config.dbURL).collection('update'),
        books: mongojs(config.dbURL).collection('books'),
        weather: mongojs(config.dbURL).collection('weather')
    };

/**
 * Setting up express
 */

//Sets up key-value-pair views:path.join(__dirname, 'views');
app.set('views', path.join(__dirname, 'views'));

app.engine('html', require('hogan-express'));
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));

/**
 * ROUTER
 */
require('./routes.js')(express, app, db, config);

app.set('port', port);
var server = require('http').createServer(app);


/**
 * export START
 */
exports.start = function() {
	server.listen(app.get('port'), function() {
    console.log("Server on port: " + app.get('port'));
	})
};