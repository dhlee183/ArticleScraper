// Dependencies
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
var request = requre("request");
var cheerio = require("cheerio");
var Promise = require("bluebird");

mongoose.Promise = Promise;

// Initialize Express
var app = express();

// Using morgan and body-parser for the app 
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
	extended: false
}));

// Making public a static directory
app.use(express.static("public"));

// Configuring the mongoose database
mongoose.connect("mongodb://localhost/article_scraper");
var db = mongoose.connection;

// Display an mongoose errors
db.on("error", function(error) {
	console.log("Mongoose Error: ", error);
});

// Console logging a success message once logged into the mongoose database
db.once("open", function() {
	console.log("Mongoose connection successful");
});

// View engine setup
app.set("views", path.join(__dirname, "views"));

// Setting up handlebars
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({
	defaultLayout: "main"
}));
app.set("view engine", "handlebars");


// Routes
app.get("/", function(req, res) {
	res.send()
});

app.get("/scrape", function(req, res) {
	request("http://www.espn.com/", function(error, response, html) {
		var $ = cheerio.load(html);

		$("article h2").each(function(i, element) {
			var result = {};

			result.title = $(this).children("a").text();
			result.link = $(this).children("a").attr("href");

			var entry = new Article(result);

			entry.save(function(err, doc) {
				if (err) {
					console.log(err);
				}
				else {
					console.log(doc);
				}
			});
		});
	});
	res.send("Scrape Complete");
});

app.get("/articles", function(req, res) {
	Article.find({}, function(error, doc) {
		if (error) {
			console.log(error);
		}
		else {
			res.json(doc);
		}
	});
});

app.get("/articles/:id", function(req, res) {
	Article.findOne({ "_id": req.params.id })
	.populate("note")
	.exec(function(error, doc) {
		if (error) {
			console.log(error);
		}
		else {
			res.json(doc);
		}
	});
});

app.post("/articles/:id", function(req, res) {
	var newNote = new Note(req.body);

	newNote.save(function(error, doc) {
		if (error) {
			console.log(error);
		}
		else {
			Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id})
			.exec(function(err, doc) {
				if (err) {
					console.log(err);
				}
				else {
					res.send(doc);
				}
			});
		}
	});
});


// Listen on port 3000
app.listen(3000, function() {
	console.log("App running on port 3000");
});
