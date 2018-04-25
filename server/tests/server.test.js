const expect = require("expect");
const request = require("supertest");
const {ObjectID} = require("mongodb");


const {app} = require("../server");
const {Todo} = require("../models/todo");

const todos = [{
	_id: new ObjectID(),
	text: "First test to do"
},{
	_id: new ObjectID(),
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

describe("GET /todos/:id", () => {
	it("should return todo doc", (done) => {
		request(app)
			.get(`/todos/${todos[0]._id.toHexString()}`)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.text).toBe(todos[0].text);
			})
			.end(done);
	});

	it("should return 404 if todo not found", (done) => {
		var id = new ObjectID();
		request(app)
			.get(`/todos/${id.toHexString()}`)
			.expect(404)
			.end(done);
	});

	it("should return 404 if id not valid", (done) => {
		var id = "123";
		request(app)
			.get(`/todos/${id}`)
			.expect(404)
			.end(done);
	});
});

describe("DELETE /todos/:id", () => {
	
	it("should remove a todo", (done) => {
		var hex_id = todos[0]._id.toHexString();
		request(app)
			.delete(`/todos/${hex_id}`) // the operation
			.expect(200) // status code
			.expect((res) => { // callback from server side
				expect(res.body.todo._id).toBe(hex_id);
			})
			.end((err, res) => { // wrap up by checking the server side DB
				// if an error occurs in above checks
				if(err)
					return done(err);
				// make sure the item is indeed deleted
				Todo.findById(hex_id).then((todo) => {
					expect(todo).toNotExist();
					done();
				}).catch((err) => done(err));
			});
	});

	it("should return 404 if todo not found", (done) => {
		var hex_id = new ObjectID().toHexString();
		request(app)
			.delete(`/todos/${hex_id}`)
			.expect(404)
			.end(done);
	});

	it("should return 404 if id not valid", (done) => {
		request(app)
			.delete(`/todos/123`)
			.expect(404)
			.end(done);
	});

});