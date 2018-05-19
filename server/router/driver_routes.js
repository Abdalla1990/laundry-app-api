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
    var body = _.pick(req.body, ['email', 'password', 'password1', 'firstName', 'lastName', 'role']);
    var body1 = {
        email: body.email,
        password: body.password,
        password1: body.password1,
        firstName: body.firstName,
        lastName: body.lastName,
        role: body.role
    }
    console.log('the user details : ', body1);
    console.log(body)
    console.log(body1)
    var user = new User(body1);


    user.save().then(() => { // this call back with a promise for the authentication function 
        // function defined in the User Modle 

        return user.generateAuthToken();

    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((err) => {
        res.status(201);
        res.send(err.message);
        console.log('error', err.message);
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
    var body = _.pick(req.body, ['email', 'password', 'firstName', 'lastName', 'interestList', 'currentCause', 'address', 'city', 'country', 'province', 'age']);
    var body1 = {
        email: body.email,
        password: body.password,
        firstName: body.firstName,
        lastName: body.lastName,
        interestList: body.interestList,
        currentCause: body.currentCause,
        address: {
            city: body.city,
            country: body.country,
            province: body.province,
            address: body.address
        },
        age: body.age
    }


    email = req.user.email;
    User.findOne({ email }).then((user) => {
        user.password = body1.password || user.password;
        user.description = body1.description || user.description;
        user.interestList = body1.interestList || user.interestList;
        user.firstName = body1.firstName || user.firstName;
        user.lastName = body1.lastName || user.lastName;
        user.currentCause = body1.currentCause || user.currentCause;
        user.address.city = body1.address.city || user.address.city;
        user.address.country = body1.address.country || user.address.country;
        user.address.province = body1.address.province || user.address.province;
        user.address.address = body1.address.address || user.address.address;
        user.age = body1.age || user.age;
        return user;
    }).then((user) => {
        console.log('###############', user.email)
        console.log('###############', user.address.address);
        user.save().then((userchanges) => {
            res.status(200).send(userchanges);

        }).catch((err) => { res.status(400).send(err) });
    });


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
            res.header('auth', token).send(User);
        });


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



module.exports = {
    create_user,
    display_users,
    update_user,
    get_user,
    log_in,
    log_out,
    user_profile
}