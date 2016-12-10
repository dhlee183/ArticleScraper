// Dependencies
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

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
app.use(express.static(process.cwd() + '/public'));

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

var routes = require('./controller/controller.js');
app.use('/', routes);

// Listen on port 3000
var port = process.env.PORT || 3000;
app.listen(port, function() {
	console.log("App running on port " + port);
});
