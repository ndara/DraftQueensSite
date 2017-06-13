var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');

var bodyParser = require('body-parser');
var Session = require('./Routes/Session.js');
var Validator = require('./Routes/Validator.js');
var CnnPool = require('./Routes/CnnPool.js');
var async = require('async');
var app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(Session.router);
app.use(function(req, res, next) {
   console.log(req.path);

   if (req.session || (req.method === 'POST' &&
    (req.path === '/Prss' || req.path === '/Ssns'))) {
      req.validator = new Validator(req, res);
      next();
   }

   else {
      res.status(401).end();
   }
});

app.use(CnnPool.router);

app.use('/Prss', require('./Routes/Account/Prss.js'));
app.use('/Ssns', require('./Routes/Account/Ssns.js'));
app.use('/Players', require('./Routes/Player/Player.js'));
app.use('/Lobbies', require('./Routes/Lobby/Lobby.js'));
app.use('/Teams', require('./Routes/Team/Team.js'));

app.delete('/DB', function(req, res) {
   var vld = req.validator;
   // Callbacks to clear tables
   if (vld.checkPrsOK(req.session.id)) {
      var cbs = ["Team", "Lobby", "Person"].map(function(tbl) {
         return function(cb) {
            req.cnn.query("delete from " + tbl, cb);
         };
      });

      // Callbacks to reset increment bases
      cbs = cbs.concat(["Team", "Lobby", "Person"]
       .map(function(tbl) {
         return function(cb) {
            req.cnn.query("alter table " + tbl + " auto_increment = 1", cb);
         };
      }));

      // Callback to reinsert admin user
      cbs.push(function(cb) {
         req.cnn.query('insert into Person (firstName, lastName, email,' +
             ' password, whenRegistered) VALUES ' +
             '("Joe", "Admin", "adm@11.com","password", NOW());', cb);
      });

      // Callback to clear sessions, release connection and return result
      cbs.push(function(callback) {
         for (var session in Session.sessions)
            delete Session.sessions[session];
         callback();
      });

      async.series(cbs, function(err) {
         req.cnn.release();
         if (err)
            res.status(400).json(err);
         else
            res.status(200).end();
      });
   }

   else {
      req.cnn.release();
   }
});


app.use(function(req, res, next) {
   res.status(404).end();
});

(function() {
   var args = process.argv.slice(2);
   var port;

   if (args[0] === '-p' && !isNaN(args[1])) {
      port = parseInt(args[1]);
   }

   else {
      throw new Error('You did not support the -p flag for port number');
   }

   app.listen(port, function() {
      console.log('App Listening on port ' + port);
   });
})();
