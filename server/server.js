'use strict';

var mainUrl = "https://hhshort-url.herokuapp.com";
// config
var env = process.env.NODE_ENV || 'development';
if (env === "development") {
  process.env.MONGODB_URI = "mongodb://localhost:27017/URL-Shortner";
	mainUrl = "http://localhost:3000";
}
// requires
const express = require('express');
const hbs = require('hbs');
const path = require('path');

// local requires
var {mongoose} = require('./db/mongoose');
var {Url} = require('./models/url');

// setting up the app
var app = express();
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, '../public')));

// render the instructions view
app.get('/', (req, res) => {
	res.render('index', {
		mainUrl
	});
});

// GET route to deal with requested urls
app.get('/new/:url(*)', (req, res) => {
	var url = req.params.url;
	var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
	if (!regex.test(url)) {
		return res.send({
			error: "Please enter a valid url"
		});
	}
	Url.findOne({originalUrl: url}).then((urlRes) => { // check if the request url is already in the database
		if (!urlRes) { // if it is not we will create a new one and send it to the user
			var shortenedUrl = Math.floor(Math.random() * 5000); // create a random number for the shortenedUrl
			var newUrl = new Url({
				originalUrl: url,
				shortenedUrl
			});
			var response = {
				original_url: url,
				shortened_url: `${mainUrl}/${shortenedUrl}`
			}
			newUrl.save().then((url) => {
				res.send(response);
			}, (e) => {
				res.status(400).send();
			});
			return res.send(response);
		}
		// if it is already in the database we will send it to the user
		var response = {
			original_url: url,
			shortened_url: `${mainUrl}/${urlRes.shortenedUrl}`
		}
		res.send(response);
	});
});

// GET route to deal with short urls
app.get('/:short', (req, res) => {
	var short = req.params.short;
	Url.findOne({shortenedUrl: short}).then((Url) => {
		if (!Url) {
			return res.send({error: "Url is not in the DB"});
		}
		res.redirect(Url.originalUrl);
	}).catch((e) => {
		res.send({error: "An Error has Occurred"});
	});
});

// listen to the port
app.listen(app.get('port'), () => {
	console.log(`Starting up on port ${app.get('port')}`);
});
