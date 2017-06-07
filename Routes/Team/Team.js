var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
var mysql = require('mysql');

router.baseURL = '/Team';

router.get('/', function(req, res) {
   var qry1 = 'select id, teamName, userId, lobbyId from Team where ' +
    'teamName = ?';
   var qry2 = 'select id, teamName, userId, lobbyId from Team where ' +
    'userId = ?';
   var qry3 = 'select id, teamName, userId, lobbyId from Team where ' +
    'teamName = ? and userId = ?';
   var noPrm = 'select id, teamName, userId, lobbyId from Team';

   if (req.query.name) {
      if (req.query.id) {
         req.cnn.chkQry(qry3, [req.query.name, req.query.id],
          function(err, tms) {
             if (!err) {
                res.status(200).json(tms);
             }
             req.cnn.release();
          });
      }

      else {
         req.cnn.chkQry(qry1, [req.query.name], function(err, tms) {
            if (!err) {
                res.status(200).json(tms);
             }
             req.cnn.release();
         });
      }
   }

   else {
      if (req.query.id) {
         req.cnn.chkQry(qry2, [req.query.id], function(err, tms) {
            if (!err) {
                res.status(200).json(tms);
             }
             req.cnn.release();
         });
      }
      
      else {
         req.cnn.chkQry(qry4, null, function(err, tms) {
            if (!err) {
                res.status(200).json(tms);
             } 
             req.cnn.release();
         });
      }
   }
});

router.get('/:teamId', function(req, res) {
   var qry = 'select id, teamName, userId, lobbyId from Team where id = ?';
   
   req.cnn.chkQry(qry, [req.params.teamId], function(err, tms) {
      if (tms.length) {
         res.status(200).json(tms[0]);
      }
      
      else {
         req.validator.check(false, Tags.notFound, null);
      }

      req.cnn.release();
   });
});

router.get('/:teamId/Players', function(req, res) {
   var qry = 'select player1, player2, player3, player4, player5, player6, ' +
    'player 7 from Team where id = ?';

   req.cnn.chkQry(qry, [req.params.teamId], function(err, plys) {
      if (plys.length) {
         res.status(200).json([plys[0]["player1"], plys[0]["playe2"],
          plys[0]["player3"], plys[0]["player4"], plys[0]["player5"],
          plys[0]["player6"], plys[0]["player7"]]);
      }
   
      else {
         req.validator.check(false, Tags.notFound, null);
      }

      req.cnn.release();
   });
});

router.post('/:teamId/Players', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;
   var tempTms = null;
   var whichInsert = null;
   
   async.waterfall([
   function(cb) {
      if (vld.hasFields(body, ["playerId"], cb)) {
         cnn.chkQry('select * from Team where id = ?',
          [req.params.teamId], cb);
      }
   },

   function(tms, fields, cb) {
      if (vld.check(tms.length, Tags.notFound, null, cb)
       && vld.chkPrsOK(tms[0]["userId"], cb)
       && vld.check(!tms[0]["player7"],
       Tags.playerLimitReached, null, cb)) {
         tempTms = tms;
         cnn.chkQry('update Lobby set turn = turn + 1 where id = ?',
          [tms[0]["lobbyId"]], cb);
      }
   },

   function(upd, fields, cb) {
      if (!tempTms[0]["player1"]) 
         whichInsert = "1";
      else if (!tempTms[0]["player2"]) 
         whichInsert = "2";
      else if (!tempTms[0]["player3"]) 
         whichInsert = "3";

      else if (!tempTms[0]["player4"]) 
         whichInsert = "4";
      else if (!tempTms[0]["player5"]) 
         whichInsert = "5";

      else if (!tempTms[0]["player5"]) 
         whichInsert = "5";
      else if (!tempTms[0]["player6"]) 
         whichInsert = "6";
      else 
         whichInsert = "7";

      cnn.chkQry('select * from Player where id = ?', 
       [body.playerId], cb);
   },

   function(plys, fields, cb) {
      if (vld.check(plys.length, Tags.notFound, null, cb)) {
         cnn.chkQry('update Team set player' + whichInsert +
          ' = ? where id = ?', [req.body.playerId, req.params.teamId], cb);
      }
   },

   function(inRes, fields, cb) {
      res.location(router.baseURL + '/' + req.params.teamId).end();
      cb();
   }],

   function() {
      cnn.release();
   });
});

module.exports = router;

