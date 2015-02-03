var http = require('http');
var _ = require('lodash');
var fs = require('fs');

var url = 'http://metadata.helmet-kirjasto.fi/search/author.json?query=Campbell';

var books = [];

http.get(url, function(res) {

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
        };

    });
    console.log("\nBook list loaded from '" + url + "'.\n");
}).on("error", function(e) {
      console.log("Error: ", e);
});

http.createServer(function(req, res) {

    var style = "<style>\n" + fs.readFileSync("style.css") + "\n</style\n";
    res.writeHead(200, {'Content-Type' : 'text/html; charset=UTF-8'});
    var HTML = "<!DOCTYPE html>\n<html>\n";
    HTML += ("<head><title>Books</title>\n");
    HTML += style;
    HTML += "</head>\n<body>\n";
    _.each(books, function(book) {
        var bookHTML = "<div class='book'>\n";
        bookHTML += "<h3>" + book.title +"</h3>\n";
        bookHTML += "<p>" + book.year + "</p>";
        bookHTML += "</div> <!-- /.book -->\n";
        HTML += bookHTML;
    })
    HTML += ("</body></html>");
    res.end(HTML);
    console.log("HTML page served!");
}).listen(8000);
