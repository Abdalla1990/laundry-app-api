const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
var OrderSchema = new mongoose.Schema({
    

    serviceType: {
        type: Array,
        required: true,

    },
    quantityType: {
        type: String,
        required: true,
      
    }, 
    createdAt: {
        type: String,
        required: true,
    
    },amount:{
        type:String,
        required:true,
       
    },
    status: {
        type: String,
        required: true,
    },
    note: {
        type: String,
        required: false,
        
    },
    lat :{
        type: Number,
        required: true,
    },
    lng :{
        type: Number,
        required: true,
    },
    user :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    }
});


OrderSchema.methods.toJSON = function() {
    var order = this;
    var orderObject = order.toObject();
    return _.pick(orderObject, ['serviceType','quantityType', 'lng', 'lat','status','createdAt','amount','user','note']);
};



OrderSchema.statics.findById = function(id) {
    var order = this;
    return order.findOne({ id }).then((order) => {
        if (!order) {
            return Promise.reject('order is not available!');
        } else {
            return new Promise((resolve, reject) => {
                bcryptjs.compare(password, order.password, (err, res) => {
                    if (res) {
                        resolve(order);
                    } else {
                        reject('Entered password is invalid', err);
                    }
                });
            });
        }
    });
};

var Order = mongoose.model('Order', OrderSchema);
module.exports = { Order };