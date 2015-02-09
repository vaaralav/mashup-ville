module.exports = function(config, resClient) {
	var xml2js = require('xml2js'),
		xmlParser = new xml2js.Parser();
	var _ = require('lodash');

	// You need to add this file on your own!
	var fmiAPIkey = require('./fmi-apikey.json');
	config.weatherURL = config.weatherURL.replace(/APIKEYHERE/, fmiAPIkey.key);
	
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
					console.log("\n\n"+JSON.stringify(d["BsWfs:BsWfsElement"][0]["BsWfs:Time"][0])+"\n");
					var t = new Date(d["BsWfs:BsWfsElement"][0]["BsWfs:Time"][0]);
					return t.getTime();
				});
				console.log("\n\n\n" + JSON.stringify(latestObs));
				var temp = latestObs["BsWfs:BsWfsElement"][0]["BsWfs:ParameterValue"][0];
				var time = new Date(latestObs["BsWfs:BsWfsElement"][0]["BsWfs:Time"][0]);
				var weather = {
					time: time.toLocaleString(),
					temperature: Number(temp)
				}
				resClient.json(weather);
			});
		});
	});
};

// var fs = require('fs'),
//     xml2js = require('xml2js');
 
// var parser = new xml2js.Parser();
// fs.readFile(__dirname + '/wfs.xml', function(err, data) {
//     parser.parseString(data, function (err, result) {
//         console.dir(JSON.stringify(result));
//         //fs.writeFile("wfs.json", JSON.stringify(result), function(err) {
//         //	if(err) throw err;
//         //})
//         console.log('Done');
//         var temp = result["wfs:FeatureCollection"]["wfs:member"][0]["BsWfs:BsWfsElement"][0]["BsWfs:ParameterValue"][0];
//     	console.log("\n\n\n" + JSON.stringify(temp));
//     });
// });


// var getLatestTemperature = function getLatestTemperature(wfs, res) {
// 	parser.parseString(data, function(err, result) {
		
// 	})
// }

// exports.latestTemperature = function(res) {
// 	getLatestTemperature(wfs, res)
// }