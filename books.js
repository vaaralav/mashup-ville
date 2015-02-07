module.exports = function(db, config, resClient) {
	var http = require('http');
	var _ = require('lodash');
	
	var books = [];

	// Check if the books list is updated in last 24 hours
	db.update.find({}, function(err, docs) {
		var lastUpdate = _.max(docs, function(d) {
			return d.updated;
		});
		console.log(lastUpdate + " : typeof -> " + typeof lastUpdate)
		if(lastUpdate === -Infinity) {
			lastUpdate = 0;
			db.update.save({updated:Date.now()});
		} else {
			lastUpdate = lastUpdate.updated;
		}
		console.log(JSON.stringify(lastUpdate) + " dsafafhdlah");
		// Book list is over 24 hours old -> update
		if((Date.now() - lastUpdate) > 24*60*60 ) {
			console.log("Update books list!");
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

			            books.push({
			                title: title,
			                year: year
			            });
			            db.books.insert(_.last(books));
			        }
			        resClient.json(books);
			        db.update.update({}, {updated:Date.now()});

			    });
			    console.log("\nBook list loaded from '" + config.booksURL + "'.\n");
			    console.log("here\n" + JSON.stringify(books));
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