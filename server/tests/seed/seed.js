const {ObjectID} = require("mongodb");
const jwt = require("jsonwebtoken");

const {Todo} = require("./../../models/todo");
const {User} = require("./../../models/user");

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
	_id: userOneId,
	email: "andrew@example.com", 
	password: "userOnePass", 
	tokens: [{
		access: "auth",
		token: jwt.sign({_id: userOneId, access: "auth"}, "abc123").toString()
	}]
}, {
	_id: userTwoId,
	email: "jen@example.com", 
	password: "userTwoPass",
	tokens: [{
		access: "auth",
		token: jwt.sign({_id: userTwoId, access: "auth"}, "abc123").toString()
	}]
}];

const todos = [{
	_id: new ObjectID(),
	text: "First test to do",
	_creator: userOneId
},{
	_id: new ObjectID(),
	text: "Second test to do",
	completed: true,
	completed_at: 2345,
	_creator: userTwoId
}];

const populateTodos = (done) => {
	Todo.remove({}).then(() => {
		Todo.insertMany(todos);
	}).then(() => done()); // empty the db
};

const populateUsers = (done) => {
	User.remove({}).then(() => {
		var userOne = new User(users[0]).save();
		var userTwo = new User(users[1]).save();

		// wait for all promise to resolve
		return Promise.all([userOne, userTwo]).then(() => {

		}).then(() => done());
	});
};

module.exports = {todos, populateTodos, users, populateUsers};