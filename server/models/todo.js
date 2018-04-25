var mongoose = require("mongoose");

// the mongoose model (a constructor function)
// the todo schema
var Todo = mongoose.model("Todo", {
	text: { // content
		type: String, 
		required: true,
		minlength: 1,
		trim: true
	}, 
	completed: { // completed or not
		type: Boolean, 
		default: false
	}, 
	completed_at: { // time of completion
		type: Number,
		default: null
	}
});

module.exports = {Todo};
