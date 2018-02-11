var { Mongoose } = require('../db/mongoose.js');
const express = require('express');
const { Order } = require('../models/orders');
const { User } = require('../models/users');
var bodyParser = require('body-parser');
var app = express();
var _ = require('lodash');
const { ObjectID } = require('mongodb');
const { authenticate } = require('../middleware/authenticate');

const axios = require('axios');
const port = process.env.PORT || 3000;
app.use(bodyParser.json());

var create_order = (req, res) => {
    console.log('inside the function');
    var body = _.pick(req.body, ['serviceType','quantityType', 'lng', 'lat','status','createdAt','amount','note','status']);
    var body1 = {
        serviceType: body.serviceType,
        quantityType: body.quantityType,
        status: body.status,
        lat: body.lat,
        lng: body.lng,
        amount: body.amount,
        createdAt:body.createdAt
    }
    var userBody = _.pick(req.body,['email','password']);
    // console.log('the user details : ', body1);
    console.log(body)
     console.log(body1)
    var order = new Order(body1);
    var user = new User(userBody);

    order.save().then((order) => {
        if(user){
            
            
            User.findByCredentials(user.email,user.password).then((user)=>{
                order.user=user.id
                order.save();
                res.status(200).send(order);
            });
        }
        
    }).catch((err) => {
        res.status(201);
        res.send(err.message);
        console.log('error',err.message);
    });

}

var display_orders = (req, res) => {

    order.find().then((Ulist) => {
        res.send(Ulist);
    }).catch((e) => {
        res.send(e);
    });
}


var update_order = (req, res) => {
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


    email = req.order.email;
    Admin.findOne({ email }).then((order) => {
        order.password = body1.password || order.password;
        order.description = body1.description || order.description;
        order.interestList = body1.interestList || order.interestList;
        order.firstName = body1.firstName || order.firstName;
        order.lastName = body1.lastName || order.lastName;
        order.currentCause = body1.currentCause || order.currentCause;
        order.address.city = body1.address.city || order.address.city;
        order.address.country = body1.address.country || order.address.country;
        order.address.province = body1.address.province || order.address.province;
        order.address.address = body1.address.address || order.address.address;
        order.age = body1.age || order.age;
        return order;
    }).then((order) => {
        console.log('###############', order.email)
        console.log('###############', order.address.address);
        order.save().then((orderchanges) => {
            res.status(200).send(orderchanges);

        }).catch((err) => { res.status(400).send(err) });
    });


}

var get_order = (req, res) => {


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



module.exports = {
    create_order,
    display_orders,
    update_order,
    get_order
}