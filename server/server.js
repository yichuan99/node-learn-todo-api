// global imports
var express = require("express");
var body_parser = require("body-parser");

const {ObjectID} = require("mongodb");
// local imports
var {mongoose} = require("./db/mongoose");
var {Todo} = require("./models/todo");
var {User} = require("./models/user");

var app = express();
const port = process.env.PORT || 3000;

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

app.get("/todos", (req, res) => {
	Todo.find().then((todos) => {
		res.send({todos});
	}, (err) => {
		res.status(400).send(err);
	});
});

// GET /todos/1234243
app.get("/todos/:id", (req, res) => {
	var id = req.params.id;
	if(!ObjectID.isValid(id)){
		res.status(404).send("ID not valid: " + id);
	}

	Todo.findById(id).then((todo) => {
		if(todo === null)
			res.status(404).send();
		res.status(200).send({todo});
	}).catch((err) => {
		res.status(404).send();
	});
	
});


app.delete("/todos/:id", (req, res) => {
	var id = req.params.id;
	if(!ObjectID.isValid(id)){
		res.status(404).send("ID not valid: " + id);
	}

	Todo.findByIdAndRemove(id).then((todo) => {
		if(!todo){
			res.status(404).send("Todo not found");
		}
		res.send({todo});
	}).catch((err) => {
		res.status(404).send();
	});

});


app.listen(port, () => {
	console.log(`Started on port ${port}`);
});

module.exports = {app};