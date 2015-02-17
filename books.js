module.exports = function(db, config, resClient) {
	var http = require('http');
	var _ = require('lodash');
	
	var books = [];

	// Check if the books list is updated in last 24 hours
	db.update.find({books: {$exists:true}}, function(err, docs) {
		
		var lastUpdate = _.max(docs, function(d) {
			return d.books;
		});

		// -Infinity -> there wasn't any updates in the database
		if(lastUpdate === -Infinity) {
			db.update.save({books:-Infinity}); // Add new update to database
		} else { // take out the interesting part for later
			lastUpdate = lastUpdate.books;
		}
		
		// Book list is over 24 hours old -> update
		if((Date.now() - lastUpdate) > 24*60*60*1000 ) {
			console.log("Update books list!");
			// Clear old list from the database
			db.books.remove({});
			http.get(config.booksURL, function(res) {

			    var body = "";

			    res.on("data", function(chunk) {
			        body += chunk;
			    });

			    res.on("end", function() {

			        var authorRes = JSON.parse(body);

			        for (var i = 0; i < authorRes.records.length; i++) {
			            var title = authorRes.records[i].title;
			            title = title.split(/ \/ $/)[0];
			            var year = authorRes.records[i].year;
			            year = year.replace(/\D+/, '');

			            var book = {
			                title: title,
			                year: year
			            };
			            db.books.insert(book);
			            books.push(book);
			        }
			        resClient.json(books);
			        db.update.update({books:{$exists:true}}, {books:Date.now()});

			    });

			}).on("error", function(e) {
			      console.log("Error: ", e);
			});
		} else {
			console.log("Use local booklist");
			db.books.find({}, function(err, docs){
				if(err) throw err;
				_.each(docs, function(d) {
					books.push({
						title: d.title,
						year: d.year
					});
				});
				resClient.json(books);
			})
		}

	});

}