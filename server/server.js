var { Mongoose } = require('./db/mongoose.js');
const express = require('express');
const { User } = require('./models/users');
var bodyParser = require('body-parser');
var app = express();
var _ = require('lodash');
const { ObjectID } = require('mongodb');
const { authenticate,authenticateAdmin } = require('./middleware/authenticate');
const user_routes = require('./router/user_routes');
const admin_routes = require('./router/admin_routes');
const order_routes = require('./router/order_routes');
const axios = require('axios');
var cors = require('cors');
const port = process.env.PORT || 3000;


app.use(bodyParser.json());
// app.use(cors());
app.use((req, res, next) =>{
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, auth");
    next();
 });

// ========== User Routes =================


app.post('/users/login', user_routes.log_in);
app.post('/users/create-user', user_routes.create_user);
// get the user's info , for admin purposes 
app.get('/users/:id', user_routes.get_user);
//display all users
app.get('/users', user_routes.display_users);
// displays all necesary fields for user's profile
app.get('/user/profile', authenticate, user_routes.user_profile);
// update user's profile 
app.put('/users/update-profile/', authenticate, user_routes.update_user);

app.delete('/users/logout', authenticate, user_routes.log_out);

//private
app.post('/users-points-trail-trip', user_routes.users_points_trails_trips);

app.post('/newTrip', authenticate, user_routes.newTrip);

// ========== Admin Routes =================


app.post('/admin/login', admin_routes.log_in);
app.post('/admin/create-admin', admin_routes.create_admin);
// get the user's info , for admin purposes 
app.get('/admin/:id', admin_routes.get_admin);
//display all users
app.get('/admin', admin_routes.display_admins);
// displays all necesary fields for user's profile
app.get('/admin/profile', authenticateAdmin, admin_routes.admin_profile);
// update user's profile 
app.put('/admin/update-profile/', authenticateAdmin, admin_routes.update_admin);

app.delete('/admin/logout', authenticateAdmin, admin_routes.log_out);

app.delete('/admin/delete/:email' , admin_routes.deleteAdmin);



//=============== Order routes =======================
app.post('/orders/create-order', order_routes.create_order);
app.post('/orders/update-order', order_routes.update_order);
app.get('/orders/get-orders',order_routes.display_orders)
app.listen(port, () => {
    console.log(`started up at port :${port}`)
});