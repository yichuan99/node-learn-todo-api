const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");

var UserSchema = new mongoose.Schema({
	email: {
		type: "string",
		required: true,
		trim: true,
		minlength: 1,
		unique: true,
		validate: {
			validator: validator.isEmail,
			message: "{VALUE} is not a valid email"
		}
	},
	password:{
		type: "string",
		require: true,
		minlength: 6
	},
	tokens: [{
		access:{
			type: "string",
			require: true
		},
		token: {
			type: "string",
			require: true
		}
	}]
});

UserSchema.methods.toJSON = function(){
	var user = this;
	var userObject = user.toObject();


	return _.pick(userObject, ["_id", "email"]);
};

// takes in a user who doesn't have a token yet
UserSchema.methods.generateAuthToken = function() {

	// create token according to the identity of this user
	var user = this;
	var access = "auth";
	var token = jwt.sign({_id: user._id.toHexString(), access}, "abc123").toString();
	
	// give the generate token to user
	user.tokens = user.tokens.concat([{access, token}]);
	
	// uses "return user.save()... "for server.js to chain
	// usually when you return to chain a promise you return another promise,
	// in this case we are just returning a value, and that is perfectly legal
	// this value will be passed as the success value (resolve) of the next then() call
	return user.save().then(() => {
		return token; 
	});
};

var User = mongoose.model("User", UserSchema);

module.exports = {User};