module.exports = function(express, app, db, config) {
	var books = require('./books.js');
	var router = express.Router();
	var tkl = require('./tkl.js');

	// index.html
	router.get('/', function(req, res, next) {
		res.render('index.html', {title:'Welcome to mashup!'});
	});

	// Booklist frontend
	router.get('/books', function(req, res, next) {
		res.render('booklist.html', {title:'Author: Campbell'});
	});

	// The real mashup!
	router.get('/mashup', function(req,res,next) {
		var twoDigits = function twoDigits(i) {
			return i < 10 ? "0"+i : i;
		}
		var t = new Date();
		res.render('mashup.html', {
			title:'mashup-ville',
			time: twoDigits(t.getHours()) + ":" + twoDigits(t.getMinutes())
		});
	});

	// Listing books
	router.get('/api/query/books', function(req, res, next) {
		books(db, config, res);
	});

	// Weather
	router.get('/api/query/weather', function(req, res, next) {
		require('./weather.js')(db, config, res);
	})

	// Bus-stops timetables
	router.get('/api/query/bus-stops', function(req, res, next) {
		tkl(db, config, res);
	})

	// Server time
	router.get('/api/query/time', function(req,res,next) {
		res.json(Date.now());
	})

	app.use('/', router);
}