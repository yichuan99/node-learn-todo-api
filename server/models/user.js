const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcryptjs");

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
	var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();
	
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

UserSchema.methods.removeToken = function(token){
	var user = this;

	return user.update({
		$pull:{
			tokens:{token}
		}
	});
};

// .statics makes the method a model (class) method instead of an instance method
UserSchema.statics.findByToken = function (token) {
	var User = this; // model method get called with the model of this binding
	var decoded; // prepare for try-catch block
	// use a try-catch block to handle jwt.verify() error cases
	try{

		decoded = jwt.verify(token, process.env.JWT_SECRET);
	}catch(err){
		// if the token verification failed
		return Promise.reject();
	}

	// if the token is successfully decoded
	// findOne will return a promise
	return User.findOne({
		"_id": decoded._id,
		"tokens.token": token,
		"tokens.access": "auth"
	});
};

// .statics makes the method a model (class) method instead of an instance method
UserSchema.statics.findByEmail = function (email) {
	var User = this; // model method get called with the model of this binding
	return User.findOne({email});
};

UserSchema.statics.findByCredentials = function (email, password){
	var User = this;
	//debugger;
	return User.findByEmail(email).then((user) => {
		if(!user){
			return Promise.reject();
		}

		return new Promise((resolve, reject) => {
			// User bcrypt.compare to compare pasword and user.password
			bcrypt.compare(password, user.password, (err, res) => {
				if(res){
					resolve(user);	
	
				}else{
					reject();
				}
			});
		});
	});
};	

// do sth before we save the user. 
UserSchema.pre("save", function(next){
	var user = this;

	if(user.isModified("password")){
		var password = user.password;
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(password, salt, (err, hash) => {
				user.password = hash;
				next();
			});
		});
	}else{
		next();
	}
}); 
var User = mongoose.model("User", UserSchema);

module.exports = {User};