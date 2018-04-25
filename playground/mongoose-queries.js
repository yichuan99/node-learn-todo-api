const {ObjectID} = require("mongodb");

const {mongoose} = require("../server/db/mongoose");
const {Todo} = require("../server/models/todo");
const {User} = require("../server/models/user");

var id = "5adfe79e0a21a5e900bf4e80";
if(!ObjectID.isValid(id)){
	console.log("ID not valid");
}
/*
Todo.find({
	_id: id
}).then((todos) => {
	console.log("Todos", todos);
});

Todo.findOne({
	_id: id
}).then((todo) => {
	console.log("Todo", todo);
});
*/

// recommended way of finding a single item
User.findById(id).then((user) => {
	if(user === null)
		return console.log("User not found");
	console.log("User", user);
}).catch((err) => {
	console.log(err);
});

