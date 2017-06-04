var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');

var bodyParser = require('body-parser');
//var Session = require('./Routes/Session.js');
//var Validator = require('./Routes/Validator.js');
//var CnnPool = require('./Routes/CnnPool.js');

var async = require('async');

var app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());

app.use(cookieParser());

//app.use(Session.router);

app.use(function(req, res, next) {
   res.status(404).end();
});

//app.use(CnnPool.router);

(function() {
   var args = process.argv.slice(2);

   if (args[0] === '-p' && !isNaN(args[1])) {
      var port = parseInt(args[1]);
   }
   else {
      throw new Error('You did not support the -p flag for port number');
   }

   app.listen(port, function() {
      console.log('App Listening on port ' + port);
   });
})();
