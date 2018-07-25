const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
var AdminSchema = new mongoose.Schema({
    //var User = mongoose.model('User', {

    email: {
        type: String,
        required: true,
        minlength: 5,
        trim: true,
        unique: true,
        validate: [{ validator: value => isEmail(value), msg: 'Invalid email.' }],
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a correct email'
        }

    },
    password: {
        type: String,
        required: true,
        minlength: 6
    }, 
    password1: {
        type: String,
        required: false,
        minlength: 6
    },role:{
        type:String,
        required:true,
        minlength: 3
    },
    firstName: {
        type: String,
        required: false,
        minlength: 5,
        trim: true,
    },
    lastName: {
        type: String,
        required: false,
        minlength: 5,
        trim: true,
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
    
    



},{
    usePushEach: true
  });


AdminSchema.methods.toJSON = function() {
    var user = this;
    var userObject = user.toObject();
    return _.pick(userObject, ['email', 'firstName', 'lastName','role']);
};


AdminSchema.methods.generateAuthToken = function() {
    var user = this;
    var access = 'auth';
    var token = jwt.sign({ _id: user._id.toHexString(), access }, 'secret').toString();
    user.tokens.push({ access, token });
    return user.save().then((user) => {
        return token;
    });

};



AdminSchema.methods.removeToken = function(token) {
    var user = this;
    return user.update({
        $pull: {
            tokens: { token }
        }
    });
};

AdminSchema.statics.removeAdmin = function(email) {
    var user = this;
    return user.remove({
        email :email
    });
};


AdminSchema.statics.findByToken = function(token) {
    var admin = this;
    var decoded;
    
    try {
        console.log('token : ', token);
        decoded = jwt.verify(token, 'secret');
        console.log('decoded : ', decoded);
    } catch (e) {
        return Promise.reject('invalid token sent ');
    }
    return admin.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};


AdminSchema.pre('save', function(next) {
    var user = this;
    if (user.isModified('password')) {

        // hashing password process
        bcryptjs.genSalt(10, (err, salt) => {

            bcryptjs.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
            
        });
    } else { next(); }

});

AdminSchema.statics.findByCredentials = function(email, password) {
    var user = this;
    return user.findOne({ email }).then((user) => {
        if (!user) {
            return Promise.reject('user is not available!');
        } else {
            return new Promise((resolve, reject) => {
                bcryptjs.compare(password, user.password, (err, res) => {
                    if (res) {
                        resolve(user);
                    } else {
                        reject('Entered password is invalid', err);
                    }
                });
            });
        }
    });
};

var Admin = mongoose.model('Admin', AdminSchema);
module.exports = { Admin };