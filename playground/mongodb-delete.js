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

	
	// deleteMany
	db.collection("Users").deleteMany({name: "John"}).then((result) => {
		console.log(result.result);
	});
	

	/*
	// deleteOne
	db.collection("Todos").deleteOne({text: "Dinner"}).then((result) => {
		console.log(result.result);
	});
	*/

	/*
	// findOneAndDelete
	db.collection("Todos").findOneAndDelete({completed: false}).then((result) => {
		console.log(result);
	});
	*/

	// client.close();
});