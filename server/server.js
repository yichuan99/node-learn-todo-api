// global imports
var express = require("express");
var body_parser = require("body-parser");

// local imports
var {mongoose} = require("./db/mongoose");
var {Todo} = require("./models/todo");
var {User} = require("./models/user");

var app = express();

// middleware
app.use(body_parser.json());

// resource creation
app.post("/todos", (req, res) => {
	var todo = new Todo({
		text: req.body.text
	});

	todo.save().then((doc) => {
		res.send(doc);
	}, (err) => {
		res.status(400).send(err);
	});
});

app.listen(3000, () => {
	console.log("Started on port 3000");
});

module.exports = {app};