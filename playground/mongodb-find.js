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

	// Fetch everything from "Todos"
	// Returns a pointer
	/*
	db.collection("Todos").find({
		_id: new ObjectID("5adf6926ce4e0f0798e16391")
	}).toArray().then((docs) => {
		console.log("Todos");
		console.log(JSON.stringify(docs, undefined, 2));
	}, (err) => {
		console.log("Unable to fetch todos", err);
	});
	*/
	db.collection("Users").find().count().then((count) => {
		console.log(count);
	}, (err) => {
		console.log("Unable to count users", err);
	});
	// client.close();
});