const expect = require("expect");
const request = require("supertest");
const {ObjectID} = require("mongodb");

const {app} = require("../server");
const {Todo} = require("../models/todo");
const {User} = require("../models/user");
const {todos, populateTodos, users, populateUsers} = require("./seed/seed");

// make sure the db is non-empty
beforeEach(populateUsers);
beforeEach(populateTodos);

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
	it("should get all todos", (done) => {
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

describe("PATCH /todos/:id", () => {
	it("should update todo to complete", (done) => {
		var hex_id_0 = todos[0]._id.toHexString();
		var body = {
			text: "test text",
			completed: true
		};
		request(app)
			.patch(`/todos/${hex_id_0}`)
			.send(body)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.completed).toBe(true);
				expect(res.body.todo.text).toBe("test text");
			})
			.end((err, res) => {
				if(err){ // check for any error in the above checks
					return done(err);
				}

				// response is good, now verify it in database
				Todo.findById(hex_id_0).then((todo) => {
					expect(todo.completed).toBe(true);
					expect(todo.text).toBe("test text");
					done();
				}).catch((err) => done(err));
			});
	});

	it("should update from complete to incomplete", (done) => {
		var hex_id_1 = todos[1]._id.toHexString();
		var text = todos[1].text;
		var body = {
			completed: false
		};
		request(app)
			.patch(`/todos/${hex_id_1}`)
			.send(body)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.completed).toBe(false);
				expect(res.body.todo.text).toBe(text);
			})
			.end((err, res) => {
				if(err){
					return done(err);
				}

				Todo.findById(hex_id_1).then((todo) => {
					expect(todo.completed).toBe(false);
					expect(todo.text).toBe(text);
					done();
				}).catch((err) => done(err));
			});
	});
});

describe("GET /users/me", () => {
	it("should return user if authenticated", (done) => {
		request(app)
			.get("/users/me")
			.set("x-auth", users[0].tokens[0].token)
			.expect(200)
			.expect((res) => {
				expect(res.body._id).toBe(users[0]._id.toHexString());
				expect(res.body.email).toBe(users[0].email);
			})
			.end(done);
	});

	it("should return 401 if not authenticated", (done) => {
		request(app)
			.get("/users/me")
			.expect(401)
			.expect((res) => {
				expect(res.body).toEqual({});
			})
			.end(done);
	});
});

describe("POST /users", () => {
	it("should post a new user if information is correct", (done) => {
		var email = "tom@example.com";
		var password = "userNewPass";
		var user = {email, password}; 

		request(app)
			.post("/users")
			.send(user)
			.expect(200)			// check for status code
			.expect((res) => {
				expect(res.headers["x-auth"]).toExist(); // we don't really care what it is, we just care if it exists when the user is created
				expect(res.body._id).toExist();// we don't really care what it is, we just care if it exists when the user is created
				expect(res.body.email).toBe(email); // check for response content
			})
			.end((err, res) => {
				if(err) { // anything above throws an error (err in response)
					return done(err);
				}							
				User.findOne({email}).then((user) => {
					expect(user).toExist();
					expect(user.email).toBe(email);
					expect(user.password).toNotBe(password); // our password should have been hashed, so it shouldn't equal
					done();
				}).catch((err) => done(err));
			});
	});

	it("should not create user email is invalid", (done) => {
		var email = "tm"; // not a valid email
		var password = "userNewPass"; // valid password
		var user = {email, password}; 

		request(app)
			.post("/users")
			.send(user)
			.expect(400)
			.end(done);
	});

	it("should not create user password is invalid", (done) => {
		var email = "tom@example.com"; // not a valid email
		var password = "uss"; // less than 6 characters, not a valid password
		var user = {email, password}; 

		request(app)
			.post("/users")
			.send(user)
			.expect(400)
			.end(done);
	});

	it("should not create user if email in use", (done) => {
		request(app)
			.post("/users")
			.send(users[0]) // already registered user
			.expect(400)
			.end(done);
	});
});

describe("POST /users/login", () => {
	it("should login user and return auth token", (done) => {
		request(app)
		.post("/users/login")
		.send(users[1])
		.expect(200)
		.expect((res) => {
			expect(res.body.email).toBe(users[1].email);
			expect(res.headers["x-auth"]).toExist();
		}).end((err, res) => {
			if(err){
				return done(err);
			}
			//done();
			// check that users[1] now has a token (it doesn't before this operation)
			User.findById(users[1]._id).then((user) => {
				expect(user.tokens[0]).toInclude({
					access: "auth",
					token: res.headers["x-auth"]
				});
				done();
			}).catch((err) => done(err));
		});
	});

	it("should reject invalid password", (done) => {
		var email = users[1].email;
		var password = users[1].password + "abc";

		request(app)
		.post("/users/login")
		.send({email, password})
		.expect(400)
		.expect((res) => {
			expect(res.headers["x-auth"]).toNotExist();
		})
		.end((err, res) => {
			if(err){
				return done(err);
			}

			// no token should have been generted
			User.findById(users[1]._id).then((user) => {
				expect(user.tokens.length).toBe(0);
				done();
			}).catch((err) => done(err));
		});
	});

	it("should reject invalid email", (done) => {
		var email = "abc" + users[1].email;
		var password = users[1].password;

		request(app)
		.post("/users/login")
		.send({email, password})
		.expect(400)
		.expect((res) => {
			expect(res.headers["x-auth"]).toNotExist();
		})
		.end((err, res) => {
			if(err){
				return done(err);
			}

			// no token should have been generted
			User.findById(users[1]._id).then((user) => {
				expect(user.tokens.length).toBe(0);
				done();
			}).catch((err) => done(err));
		});
	});

});