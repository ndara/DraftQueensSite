var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
var mysql = require('mysql');

router.baseURL = '/Players';

router.get('/', function(req, res) {
   var query = 'select id, fname, lname, pos1, height, weight, team ' +
    'from Player where pos1 = ?';
   var noPrm = 'select id, fname, lname, pos1, height, weight, team ' +
    'from Player';
   var noPrmLby = 'select P.id, fname, lname, pos1, height, weight, P.team ' +
    'from Player P join Team T on (T.player1 <> P.id) and (T.player2 <> ' + 
    'P.id) and (T.player3 <> P.id) and (T.player4 <> P.id) and (T.player5 ' +
    '<> P.id) and (T.player6 <> P.id) and (T.player7 <> P.id) ' +
    'where T.lobbyId = ?';
   var queryLby = 'select P.id, fname, lname, pos1, height, weight, P.team ' +
    'from Player P join Team T on (T.player1 <> P.id) and (T.player2 <> ' + 
    'P.id) and (T.player3 <> P.id) and (T.player4 <> P.id) and (T.player5 ' +
    '<> P.id) and (T.player6 <> P.id) and (T.player7 <> P.id) where ' +
    'T.lobbyId = ? and pos1 = ?';

   if (req.query.position) {
      if (req.query.lobby) {
         req.cnn.chkQry(queryLby, [req.params.lobby, req.params.position],
          function (err, plys){
             if (!err) {
               res.status(200).json(plys);
            }
            req.cnn.release();
          });
      }

      else {
         req.cnn.chkQry(query, [req.query.position], function(err, plys) {
            if (!err) {
               res.status(200).json(plys);
            }
            req.cnn.release();
         });
      }
   }

   else {
      if (req.query.lobby) {
         req.cnn.chkQry(noPrmLby, [req.params.lobby], function(err, plys) {
            if (!err) {
               res.status(200).json(plys);
            }
            req.cnn.release();
         });
      }

      else {
         req.cnn.chkQry(noPrm, null, function(err, plys) {
            if (!err) {
               res.status(200).json(plys);
            }
            req.cnn.release();
         });
      }
   }
});

router.get('/:playerId', function(req, res) {
   var query = 'select id, fname, lname, pos1, height, weight, team ' +
    'from Player where id = ?'
   
   req.cnn.chkQry(query, [req.params.playerId],
   function(err, plys) {
      if (plys.length) {
         res.status(200).json(plys[0]);
      }
         
      else {
         req.validator.check(false, Tags.notFound, null);
      }

      req.cnn.release();
   });
});

module.exports = router;
