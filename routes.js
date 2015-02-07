module.exports = function(express, app, db, config) {
	var books = require('./books.js');
	var router = express.Router();

	// index.html
	router.get('/', function(req, res, next) {
		res.render('index.html', {title:'Welcome to mashup!'});
	});

	// Listing books
	router.get('/api/query/books', function(req, res, next) {
		books(db, config, res);
	})

	app.use('/', router);
}