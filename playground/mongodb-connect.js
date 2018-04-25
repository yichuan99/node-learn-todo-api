// const mongo_client  = require("mongodb").MongoClient;
const {MongoClient, ObjectID} = require("mongodb");

var mongo_client = MongoClient;


/*
// object destructuring
var user = {name: "John", age: 22};
var {name} = user;
console.log(name);
*/

mongo_client.connect("mongodb://localhost:27017/TodoApp", (err, client) => {
	if(err){
		return console.log("Unable to connect to MongoDB server");
	}
	console.log("Connected to MongoDB server");
	const db = client.db("TodoApp");	

	/*
	db.collection("Todos").insertOne({
		text: "Something to do",
		completed: false
	}, (err, result) => {
		if(err){
			return console.log("Unable to insert todo", err);
		}

		console.log(JSON.stringify(result.ops, undefined, 2));
	});
	*/

	/*
	db.collection("Users").insertOne({
		name: "John",
		age: 25
	}, (err, result) => {
		if(err){
			return console.log("Unable to insert user", err);
		}

		console.log(result.ops[0]._id.getTimestamp());
		// console.log(JSON.stringify(result.ops, undefined, 2));
	});
	*/

	client.close();
});