# giver-trail-backend
my current node.js project (restful API integrated with react/native app)


routes ( currently public but will be made private as development carries on) 
1- /users/create-user 
{
	"email" : "",
	"firstName" : "",
	"lastName" : "",
	"password" : "",
	"pointesEarned": 1,
	"currentCause":""
}
2- /users/(user id) => displays the user's info (excluding the password)
