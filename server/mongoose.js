var mongoose = require("mongoose");

// use promise
mongoose.Promise = global.Promise;

// get mongoose connected to the database
mongoose.connect("mongodb://localhost:27017/TodoApp");