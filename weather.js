module.exports = function(db, config, resClient) {
	var xml2js = require('xml2js'),
		xmlParser = new xml2js.Parser();
	var _ = require('lodash');

	var wSymbol = require('./weathersymbol3.json');

	// Check if the weather is updated in the last 10 minutes
	db.weather.find({}, function(err, docs) {

		var lastUpdate = {};

		// if there's no weather data
		if(docs.length == 0) {
			lastUpdate = 0;
		} else {
			lastUpdate = _.max(docs, function(d) {
					return (new Date(d.time)).getTime();
				});
			lastUpdate = (new Date(lastUpdate.time)).getTime();
		}




		// Weather info is over 10 minutes old -> update!
		if((Date.now() - lastUpdate) > 10*60*1000 ) {
			console.log("Update weather data");
			db.weather.remove({});
			// You need to add this file on your own!
			var fmiAPIkey = require('./fmi-apikey.json');
			config.weatherURL = config.weatherURL.replace(/APIKEYHERE/, fmiAPIkey.key);
			config.forecastURL = config.forecastURL.replace(/APIKEYHERE/, fmiAPIkey.key);

			// Get weather data
			require('http').get(config.weatherURL, function(res) {
				var body = "";

				res.on("data", function(chunk) {
				    body += chunk;
				});

				res.on("end", function() {
					// Parse observation time and temperature
					xmlParser.parseString(body, function(err, result) {
						if(err) throw err;

						var latestObs = _.max(result["wfs:FeatureCollection"]["wfs:member"], function(d) {
							var t = new Date(d["BsWfs:BsWfsElement"][0]["BsWfs:Time"][0]);
							return t.getTime();
						});
						var temp = latestObs["BsWfs:BsWfsElement"][0]["BsWfs:ParameterValue"][0];
						var time = new Date(latestObs["BsWfs:BsWfsElement"][0]["BsWfs:Time"][0]);
						var weather = {
							time: time.toLocaleString(),
							temperature: Number(temp)
						}





						// Get Weather Symbol from closest forecast
						require('http').get(config.forecastURL, function(res) {
							var body = "";

							res.on('data', function(chunk) {
								body += chunk;
							});

							res.on("end", function(){

								xmlParser.parseString(body, function(err, result) {
									if (err) throw err;
									// Numeric value for symbol in closest forecast
									weather.symbolValue = +result["wfs:FeatureCollection"]["wfs:member"][0]["BsWfs:BsWfsElement"][0]["BsWfs:ParameterValue"];
									weather.symbolDesc = wSymbol[ weather.symbolValue ];
									//weather.symbolPic = "img/weather/" + weather.symbolValue + ".png";
		 						})





		 						/*******************************
		 						 * SEND WEATHER INFO TO CLIENT *
		 						 *******************************/
		 						resClient.json(weather);
		 						db.weather.save(weather);
							});
						});
					});
				});
			});
		}
		else {
			console.log("Use local weather data");
			db.weather.findOne({}, function(err, doc){
				if(err) throw err;
				resClient.json(doc);
			})
		}
	});
};