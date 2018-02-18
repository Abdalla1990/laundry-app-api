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
    var body = _.pick(req.body, ['serviceType','quantityType', 'lng', 'lat','status','createdAt','amount','note','status','auth']);
    console.log('req : ', req.body);
    var body1 = {
        serviceType: body.serviceType,
        quantityType: body.quantityType,
        status: body.status,
        lat: body.lat,
        lng: body.lng,
        amount: body.amount,
        createdAt:body.createdAt,
        auth : body.auth
    }
    
    
    var order = new Order(body1);
   
    var auth = req.body.auth;
    order.save().then((order) => {
       
       
            User.findByToken(auth).then((user)=>{
                console.log('i found the user : ', user );
                order.user=user.id
                order.save();
                res.status(200).send(order);
            });
        
        
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
    var Neworder = _.pick(req.body, ['id','serviceType','quantityType', 'lng', 'lat','status','createdAt','amount','note','status','auth']);
   // console.log('order : ', Neworder);
    

    
    var id = Neworder.id;
    console.log('id : ',id);
    User.findByToken(Neworder.auth).then((user)=>{
        var userId = user.id;
    console.log('user found : ', user);
        Order.findOne({ _id:id }).then((order) => {
    console.log('order found : ', order )
            order.status = Neworder.status;
            order.lat = Neworder.lat;
            order.lng = Neworder.lng;
            order.user = Neworder.user;
            order.serviceType = Neworder.serviceType;
            order.quantityType = Neworder.quantityType;
            order.note = Neworder.note;
            order.amount = Neworder.amount;
            order.createdAt = Neworder.createdAt;
            order.user = userId;
            return order;
         }) .then((order) => {
             console.log('returned order : ',order);
             
             order.save().then((orderchanges) => {
                 res.status(200).send(orderchanges);
     
             }).catch((err) => { res.status(400).send(err) });
         });
    }).catch((err)=>{
        res.status(201).send(err);
    })
    


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