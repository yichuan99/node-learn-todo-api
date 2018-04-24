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
	db.collection("Users").findOneAndUpdate({
		_id: new ObjectID("5adf6a05f4a2b73b80140b54")
	}, {
		$inc: {
			age: 2
		}
	}, {
		returnOriginal: false
	}).then((result) => {
		console.log(result);
	});
	

	// client.close();
});