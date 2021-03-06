var { User } = require('./../models/users');
var {Admin} = require('./../models/admin');

var authenticate = (req, res, next) => {
    var token = req.header('x-auth');
    // console.log('TOKEN : ', token)
    User.findByToken(token).then((user) => {
        if (!user) {
            console.log('USER IS NOT FOUND')
            return Promise.reject();
        }
        req.user = user;

        req.token = token;

        next();
    }).catch((err) => {
        res.status(401).send({"ERROR":"UNAUTHORIZED ACCESS"});
    });
}
var authenticateAdmin = (req, res, next) => {
    console.log('req , ',req)
    var token = req.header('x-auth');
    Admin.findByToken(token).then((admin) => {
        if (!admin) {
            return Promise.reject('no admin');
        }
        req.admin = admin;

        req.token = token;

        next();
    }).catch((err) => {
        console.log('error : ', err);
        res.status(401).send();
    });
}

module.exports = {
    authenticate,
    authenticateAdmin
}