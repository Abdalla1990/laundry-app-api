var { Mongoose } = require('../db/mongoose.js');
const express = require('express');
const { User } = require('../models/users');
var bodyParser = require('body-parser');
var app = express();
var _ = require('lodash');
const { ObjectID } = require('mongodb');
const { authenticate } = require('../middleware/authenticate');

const axios = require('axios');
const port = process.env.PORT || 3000;
app.use(bodyParser.json());




var create_user = (req, res) => {
    console.log('inside the function');
    var body = _.pick(req.body, ['email', 'password','password1', 'firstName', 'lastName','role']);
    var body1 = {
        email: body.email,
        password: body.password,
        password1: body.password1,
        firstName: body.firstName,
        lastName: body.lastName,
        role : body.role
    }
    console.log('the user details : ', body1);
    console.log(body)
    console.log(body1)
    var user = new User(body1);


    user.save().then(() => { // this call back with a promise for the authentication function 
        // function defined in the User Modle 

        return user.generateAuthToken();

    }).then((token) => {
        NewUser = {
            user : user , 
            auth : token
        }
        res.send(NewUser);
    }).catch((err) => {
        res.status(201);
        res.send(err.message);
        console.log('error',err.message);
    });

}


var display_users = (req, res) => {

    User.find().then((Ulist) => {
        res.send(Ulist);
    }).catch((e) => {
        res.send(e);
    });
}


var update_user = (req, res) => {
    console.log('req', req);
    var body = _.pick(req.body, ['email', 'password', 'firstName', 'lastName']);
    


    email = req.body.email;
    User.findOne({ email }).then((user) => {
        user.email= body.email || user.email
        user.password = body.password || user.password;
        user.firstName = body.firstName || user.firstName;
        user.lastName = body.lastName || user.lastName;
        return user;
    }).then((user) => {
        console.log('###############', user)
        user.save().then((userchanges) => {
            res.status(200).send(userchanges);
        }).catch((err) => { res.status(400).send(err) });
    }).catch((err) => { res.status(400).send(err) });


}



var remove_user = (req,res)=>{
    console.log('req', req.body);
    
    User.findOneAndRemove({_id: req.body._id}).then((deleted)=>{
        console.log('delete : ', deleted);
        res.status(200).send(deleted);
    }).catch((err)=>{
        res.status(404).send(err);
    })
}
var get_user = (req, res) => {


    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        res.status(400).send('Id field is empty or Id is not correct');
    }
    User.findById(id).then((doc) => {
        res.status(200).send({ doc });
    }).catch((err) => {
        res.status(400).send(err);
    });

}

var log_in = (req, res) => {
    console.log('inside the function');
    var body = _.pick(req.body, ['email', 'password']);
    console.log(req.body.email);
    console.log(req.body.password);



    User.findByCredentials(body.email, body.password).then((User) => {

       
        return User.generateAuthToken().then((token) => {
            
            console.log('auth : ', User)
            NewUser = {
                user : User , 
                auth : token
            }
            res.send(NewUser);
            
        }).catch((err)=>{res.status(400).send(err)});


    }).catch((err) => {
        res.status(400).send(err)
    });

}

var user_profile = (req, res) => {
    console.log('inside the function');
    res.send(req.user);
}

var log_out = (req, res) => {

    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }).catch((err) => {
        res.status(400).send();
    });


}


let users_points_trails_trips = (req, res) => {
    var bodyUser = _.pick(req.body, ['email', 'password']);
    var bodyTrail = _.pick(req.body, ['name', 'description']);
    var bodyPoint = _.pick(req.body, ['thepoints']);
    var bodyTrip = _.pick(req.body, ['timeStarted', 'timeEnded']);
    var user = new User(bodyUser);
    var trail = new Trails(bodyTrail);
    var point = new Points(bodyPoint);
    var trip = new Trips(bodyTrip);
    user.email = bodyUser.email;
    user.password = bodyUser.password;
    trail.name = bodyTrail.name;
    trail.description = bodyTrail.description;
    point.trail = trail;
    user.trail = trail;

    point.user = user;

    trip.trail = trail;
    trip.user = user;
    trip.time.timeStarted = bodyTrip.timeStarted;
    trip.time.timeEnded = bodyTrip.timeEnded;
    trip.time.timeSpent = bodyTrip.timeEnded - bodyTrip.timeStarted;
    point.earnedPoints = trip.time.timeSpent * 10;
    trip.pointsEarned = point.earnedPoints;
    point.trip = trip





    let data = [];

    //if (user && trail && point & trip) {


    trail.save().then(() => {
            data[0] = trail;
            console.log('inside trail');
        }).then(() => {

            point.save().catch((err) => { console.log(err) });
            console.log('inside point');
            data[1] = point;
        }).then(() => {
            user.save().catch((err) => { console.log(err) });
            console.log('inside user');
            var token = user.generateAuthToken();
            res.header('x-auth', token);
            data[2] = user;
        }).then(() => {

            trip.save().catch((err) => { console.log(err) });
            console.log('inside trip');
            data[3] = trip;
            console.log('success!');
            res.status(200).send(data);

        }).catch((err) => {
            console.log('something went wrong , ', err)
        })
        //}

};

let newTrip = (req, res) => {
    var bodyTrail = _.pick(req.body, ['trailId']);
    var bodyTrip = _.pick(req.body, ['timeStarted', 'timeEnded']);
    var bodyUser = req.user;

    let trip = new Trips(bodyTrip);
    Trails.findOne({ _id: bodyTrail.trailId }).then((trail) => {
        trip.trail = trail;
        trip.time.timeStarted = bodyTrip.timeStarted;
        trip.time.timeEnded = bodyTrip.timeEnded;
        trip.user = bodyUser;
        trip.save().then((data) => {
            let userId = data.user._id
            User.findOne({ _id: userId }).then((user) => {
                user.trips.push(data._id);
                return user
            }).then((user) => {
                user.save();
            }).then(() => {
                console.log(data)
                res.status(200).send(data);
            })

        }).catch((err) => {
            res.status(400).send(err)
        })
        User.findOne()
    });
};

module.exports = {
    create_user,
    display_users,
    update_user,
    get_user,
    log_in,
    log_out,
    user_profile,
    remove_user
}