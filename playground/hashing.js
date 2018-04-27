const{SHA256} = require("crypto-js");
const jwt = require("jsonwebtoken");

var data = {
	id: 10
}

var data2 = {
	id: 11
}

var salt = "123abc";
var token = jwt.sign(data, salt);
var token2 = jwt.sign(data2, salt);

// only the person uses the correct salt will trick the verify, but the salt
// is encoded in hashing, which will never be found out
// the purpose of hashing is actually to protect the salt

// the hash jwt on server side is a lock, and the user is issued a unique key
// nobody can create key since no one knows how it's created (they need correct 
// salt, which is hashed and impossible to find out by user since one-way hashing)
var decoded = jwt.verify(token, salt);
var decoded2 = jwt.verify(token2, salt);

console.log(decoded);
console.log(decoded2);

/*
var message = "I'm user number 3";
var hash = SHA256(message).toString();

console.log(`Message ${message}`);
console.log(`Hash ${hash}`);

var data = {
	id: 4
};

// the purpose of hashing is to prevent user from pretending to be someone else
var token = {
	data,
	hash: SHA256(JSON.stringify(data) + "somesecret").toString()
}

resultHash = SHA256(JSON.stringify(token.data)+"somesecret").toString();
 
if(resultHash === token.hash){
	console.log("Data was not changed");
} else {
	console.log("Don't trust");
}
*/