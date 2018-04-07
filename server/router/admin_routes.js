var { Mongoose } = require('../db/mongoose.js');
const express = require('express');
const { Admin } = require('../models/admin');
var bodyParser = require('body-parser');
var app = express();
var _ = require('lodash');
const { ObjectID } = require('mongodb');
const { authenticate } = require('../middleware/authenticate');
const {defaultPassword} = require('../db/settings')
const axios = require('axios');
const port = process.env.PORT || 3000;
app.use(bodyParser.json());




var create_admin = (req, res) => {
    console.log('inside the function');
    var body = _.pick(req.body, ['email', 'password','password1', 'firstName', 'lastName','role']);
    var body1 = {
        email: body.email,
        password: body.password,
        password1: body.password1,
        firstName: body.firstName,
        lastName: body.lastName,
        role : 'admin'
    }
    console.log('the admin details : ', body1);
    console.log(body)
    console.log(body1)
    if(body1.password === undefined){
        body1.password = defaultPassword
    }
    var admin = new Admin(body1);


    admin.save().then(() => { // this call back with a promise for the authentication function 
        // function defined in the Admin Modle 

        return admin.generateAuthToken();

    }).then((token) => {
        NewUser = {
            user : admin , 
            auth : token
        }
        res.send(NewUser);
    }).catch((err) => {
        res.status(201);
        res.send(err.message);
        console.log('error',err.message);
    });

}


var display_admins = (req, res) => {

    Admin.find().then((Ulist) => {
        res.send(Ulist);
    }).catch((e) => {
        res.send(e);
    });
}


var update_admin = (req, res) => {
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


    email = req.admin.email;
    Admin.findOne({ email }).then((admin) => {
        admin.password = body1.password || admin.password;
        admin.description = body1.description || admin.description;
        admin.interestList = body1.interestList || admin.interestList;
        admin.firstName = body1.firstName || admin.firstName;
        admin.lastName = body1.lastName || admin.lastName;
        admin.currentCause = body1.currentCause || admin.currentCause;
        admin.address.city = body1.address.city || admin.address.city;
        admin.address.country = body1.address.country || admin.address.country;
        admin.address.province = body1.address.province || admin.address.province;
        admin.address.address = body1.address.address || admin.address.address;
        admin.age = body1.age || admin.age;
        return admin;
    }).then((admin) => {
        console.log('###############', admin.email)
        console.log('###############', admin.address.address);
        admin.save().then((adminchanges) => {
            res.status(200).send(adminchanges);

        }).catch((err) => { res.status(400).send(err) });
    });


}

var get_admin = (req, res) => {


    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        res.status(400).send('Id field is empty or Id is not correct');
    }
    Admin.findById(id).then((doc) => {
        res.status(200).send({ doc });
    }).catch((err) => {
        res.status(400).send(err);
    });

}

var log_in = (req, res) => {
    console.log('inside the function');
    var credentials = _.pick(req.body, ['email', 'password']);
    console.log(credentials.email);
    console.log(credentials.password); 



    Admin.findByCredentials(credentials.email, credentials.password).then((Admin) => {

        return Admin.generateAuthToken().then((token) => {
            NewUser = {
                user : Admin , 
                auth : token
            }
            res.send(NewUser);
        });


    }).catch((err) => {
        res.status(400).send(err)
    });

}

var admin_profile = (req, res) => {
    console.log('inside the function');
    res.send(req.admin);
}

var log_out = (req, res) => {

    req.admin.removeToken(req.token).then(() => {
        res.status(200).send();
    }).catch((err) => {
        res.status(400).send();
    });


}

var deleteAdmin = (req, res) => {
    var email = req.params.email;
    Admin.removeAdmin(email).then(() => {
        res.status(200).send('user has been deleted');
    }).catch((err) => {
        res.status(400).send(' user not found or something went wrong');
    });


}


module.exports = {
    create_admin,
    display_admins,
    update_admin,
    get_admin,
    log_in,
    log_out,
    admin_profile,
    deleteAdmin
}