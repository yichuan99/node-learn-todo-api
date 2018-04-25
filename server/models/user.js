var mongoose = require("mongoose");

var User = mongoose.model("User", {
	email: {
		type: "string",
		required: true,
		trim: true,
		minlength: 1
	}
});

module.exports = {User};