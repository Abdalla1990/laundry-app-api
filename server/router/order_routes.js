var { Mongoose } = require('../db/mongoose.js');
const express = require('express');
const { Order } = require('../models/orders');
const { User } = require('../models/users');
const {Admin} = require('../models/admin');
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
    var userId = req.params.id;
    console.log('USERID : ',userId);
    Order.find({user:userId}).populate('user').then((orders) => {
        console.log('orders',orders);
        res.status(200).send(orders);
    }).catch((err)=>{
        console.log('error',err);
        res.send(err);
    })
    
}

var get_orders = (req, res) => {
   
    
    Order.find().populate('user').then((orders) => {
        console.log('orders',orders);
        res.status(200).send(orders);
    }).catch((err)=>{
        console.log('error',err);
        res.send(err);
    })
    
}



var update_order = (req, res) => {
    var Neworder = _.pick(req.body, ['_id','serviceType','quantityType', 'lng', 'lat','status','createdAt','amount','note','status','auth','access']);
   // console.log('order : ', Neworder);
    

    
    var id = Neworder._id;
    console.log('id : ',id);
    console.log('auth : ', Neworder.auth);
    var access = Neworder.access;
    if(access === 'admin'){
        Admin.findByToken(Neworder.auth).then((admin)=>{
            var userId = admin._id;
        console.log('admin found : ', admin);
            Order.findOne({ _id:id }).then((order) => {
        console.log('order found : ', order )
                order.status = Neworder.status;
                order.lat = Neworder.lat;
                order.lng = Neworder.lng;
                order.serviceType = Neworder.serviceType;
                order.quantityType = Neworder.quantityType;
                order.note = Neworder.note;
                order.amount = Neworder.amount;
                order.createdAt = Neworder.createdAt;
                return order;
             }) .then((order) => {
                 console.log('returned order : ',order);
                 
                 order.save().then((orderchanges) => {
                     res.status(200).send(orderchanges);
         
                 }).catch((err) => { console.log(err);res.status(400).send(err) });
             });
        }).catch((err)=>{
            var message = "UNAUTHORIZED ACCESS"
            res.status(401).send(message);
        })
    }else{
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
         
                 }).catch((err) => { console.log(err);res.status(400).send(err) });
             });
        }).catch((err)=>{
            var message = "UNAUTHORIZED ACCESS"
            res.status(401).send(message);
        })
    }
    
    


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

var remove_orders = (req,res)=>{
    console.log('REMOVE ',req.body._id)
    Order.findByIdAndRemove(req.body._id).then((data,err)=>{
        console.log('DATA IS : ',data ,err);
        if(data === undefined){
            res.status(201).send({"error":"No Orders found"});
            return;
        }
        console.log('IFOUND IT ', data,err);
        res.status(200).send(data);
    }).catch((err)=>{
        console.log('error',err);
    });
   
}

module.exports = {
    create_order,
    display_orders,
    get_orders,
    update_order,
    get_order,
    remove_orders
}