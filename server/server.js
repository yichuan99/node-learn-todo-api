require("./config/config");

// global imports
const _ = require("lodash");
const express = require("express");
const body_parser = require("body-parser");
const {ObjectID} = require("mongodb");
const bcrypt = require("bcryptjs");

// local imports
var {mongoose} = require("./db/mongoose");
var {Todo} = require("./models/todo");
var {User} = require("./models/user");
var {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

// middleware
app.use(body_parser.json());

// resource creation
app.post("/todos", authenticate, (req, res) => {
	var todo = new Todo({
		text: req.body.text,
		_creator: req.user._id
	});

	todo.save().then((doc) => {
		res.send(doc);
	}, (err) => {
		res.status(400).send(err);
	});
});

app.get("/todos", authenticate, (req, res) => {
	Todo.find({
		_creator:req.user._id
	}).then((todos) => {
		res.send({todos});
	}, (err) => {
		res.status(400).send(err);
	});
});

// GET /todos/1234243
app.get("/todos/:id", authenticate, (req, res) => {
	var id = req.params.id;
	if(!ObjectID.isValid(id)){
		res.status(404).send("ID not valid: " + id);
	}

	Todo.findOne({
		_id: id,
		_creator: req.user._id
	}).then((todo) => {
		if(todo === null)
			res.status(404).send(); 
		res.status(200).send({todo});
	}).catch((err) => {
		res.status(404).send();
	});
	
});


app.delete("/todos/:id", authenticate, (req, res) => {
	var id = req.params.id;
	if(!ObjectID.isValid(id)){
		res.status(404).send("ID not valid: " + id);
	}

	Todo.findOneAndRemove({
		_id: id,
		_creator: req.user._id
	}).then((todo) => {
		if(!todo){
			res.status(404).send("Todo not found");
		}
		res.send({todo});
	}).catch((err) => {
		res.status(404).send();
	});
});

app.patch("/todos/:id", authenticate, (req, res) => {
	// extract useful components from the request
	var id = req.params.id;
	var body = _.pick(req.body, ["text", "completed"]);
	if(!ObjectID.isValid(id)){
		res.status(404).send("ID not valid: " + id);
	}

	// modify the copy of request body accordingly
	if(_.isBoolean(body.completed) && body.completed){
		body.completed_at = new Date().getTime();
	}else{
		body.completed = false;
		body.completed_at = null;
	}
	Todo.findOneAndUpdate(
			{_id: id, _creator: req.user._id},
		 	{$set: body}, {new: true}).then((todo) => {
		if(!todo){
			return res.status(404).send();
		}
		res.send({todo});
	}).catch((e) => {
		res.status(400).send();
	});
});

// the app.post() works in background and get
// all the HTTP stuff handled. It extracts the request
// and pass down a response handler to send stuff back
// the callback is about how to handle the req and send a res

/*
	app.listen(port, ()=>{"server started"})  -------> starts listening
			|
			v
	app.post("/abc", callback){
		extract the request content -> req
		create a response object -> res
		when finished, pass the case down to callback
		callback(req, res)	
	}
			|
			v
	(req, res) => {  --> this is the call back to client
		handle the request accordingly
		use res object to send info back to client
	}
*/

app.post("/users", (req, res) => {
	var body = _.pick(req.body, ["email", "password"]);

	// debug print lines
	// console.log("req.body", req.body);
	// console.log("body: ", body);
	
	var user = new User(body);

	user.save().then(() => {
		return user.generateAuthToken();
	})
	.then((token) => {
		res.header("x-auth", token).send(user);
	})
	.catch((err) => {
		res.status(400).send(err);
	});
});

app.get("/users/me", authenticate, (req, res) => {
	res.send(req.user);
});

// POST /users/login {email, password}
app.post("/users/login", (req, res) => {
	var body = _.pick(req.body, ["email", "password"]);
	//debugger;
	User.findByCredentials(body.email, body.password)
	.then((user) => {
		return user.generateAuthToken().then((token) => {
			// give the browser a user cookie
			res.header("x-auth", token).send(user);
		});
	
	}).catch((err) => {
		res.status(400).send(err);
	});
});

app.delete("/users/me/token", authenticate, (req, res) => {
	req.user.removeToken(req.token).then(() => {
		res.status(200).send();
	}, () => {
		res.status(400).send();
	});
});

// Event Listener
app.listen(port, () => {
	console.log(`Started on port ${port}`);
});

module.exports = {app};