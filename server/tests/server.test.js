const expect = require("expect");
const request = require("supertest");

const {app} = require("../server");
const {Todo} = require("../models/todo");

const todos = [{
	text: "First test to do"
},{
	text: "Second test to do"
}];

// make sure the db is empty
beforeEach((done) => {
	Todo.remove({}).then(() => {
		Todo.insertMany(todos);
	}).then(() => done()); // empty the db
});

describe("POST /todos", () => {
	it("should create a new todo", (done) => {
		var text = "Test todo test";

		request(app)
			.post("/todos")
			.send({text})
			.expect(200)			// check for status code
			.expect((res) => {
				expect(res.body.text).toBe(text); // check for response content
			})
			.end((err, res) => {
				if(err) { // anything above throws an error (err in response)
					return done(err);
				}							// check the DB side
				Todo.find({text}).then((todos) => { // there should be 1 item in DB
					expect(todos.length).toBe(1);
					expect(todos[0].text).toBe(text);
					done();
				}).catch((err) => done(err));
			});
	});

	it("should not create todo with invalid body data", (done) => {
		var text = "";

		request(app)  			 
			.post("/todos")			
			.send({text})	
			.expect(400)			// check for return status code
			.end((err, res) => {    
				if(err) { // anything above throws an error (err in response)
					return done(err);
				}								// check the DB side
				Todo.find().then((todos) => { // check for database
					expect(todos.length).toBe(2);
					done();
				}).catch((err) => done(err));
			});
	});
});


describe("GET /todos", () => {
	it("shout get all todos", (done) => {
		request(app)
			.get("/todos")
			.expect(200)
			.expect((res) => {
				expect(res.body.todos.length).toBe(2);
			})
			.end(done);
	});
});