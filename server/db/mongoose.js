var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/laundry-app');
mongoose.connection.on('open', function() {
    mongoose.connection.db.admin().serverStatus(function(error, info) {
      console.log(info);
    });
  });
module.exports = { mongoose };