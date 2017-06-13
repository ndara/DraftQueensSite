var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
var mysql = require('mysql');

router.baseURL = '/Players';

var removePlayers = function(req, res, err, tms, savedPlys) {
   var newPlys = [];

   if (!err) {
      if (tms.length == 2) {
         for (i = 0; i < savedPlys.length; i++) {
            if (savedPlys[i].id !== tms[0]['player1'] &&
             savedPlys[i].id !== tms[0]['player2'] &&
             savedPlys[i].id !== tms[0]['player3'] &&
             savedPlys[i].id !== tms[0]['player4'] &&
             savedPlys[i].id !== tms[0]['player5'] &&
             savedPlys[i].id !== tms[0]['player6'] &&
             savedPlys[i].id !== tms[0]['player7'] &&
             savedPlys[i].id !== tms[1]['player1'] &&
             savedPlys[i].id !== tms[1]['player2'] &&
             savedPlys[i].id !== tms[1]['player3'] &&
             savedPlys[i].id !== tms[1]['player4'] &&
             savedPlys[i].id !== tms[1]['player5'] &&
             savedPlys[i].id !== tms[1]['player6'] &&
             savedPlys[i].id !== tms[1]['player7']) {
                newPlys.push(savedPlys[i]);
             }
         }
         res.status(200).json(newPlys);
      }
      else if (tms.length == 1) {
         for (i = 0; i < savedPlys.length; i++) {
            if (savedPlys[i].id !== tms[0]['player1'] &&
             savedPlys[i].id !== tms[0]['player2'] &&
             savedPlys[i].id !== tms[0]['player3'] &&
             savedPlys[i].id !== tms[0]['player4'] &&
             savedPlys[i].id !== tms[0]['player5'] &&
             savedPlys[i].id !== tms[0]['player6'] &&
             savedPlys[i].id !== tms[0]['player7']) {
                newPlys.push(savedPlys[i]);
             }
         }
         res.status(200).json(newPlys);
      }

      else {
         res.status(200).json(savedPlys);
      }
   }
};

router.get('/', function(req, res) {
   var savedPlys = null;
   var i = 0;
   if (req.query.position) {
      if (req.query.lobby) {
         req.cnn.chkQry('select id, fname, lname, pos1, height, weight, team'
          + ' from Player where pos1 = ?', [req.query.position],
          function(err, plys) {
             if (!err) {
                savedPlys = plys;
                req.cnn.chkQry('select player1, player2, player3, player4, '
                 + 'player5, player6, player7 from Team where lobbyId = ?',
                 [req.query.lobby], function(err, tms) {
                    removePlayers(req, res, err, tms, savedPlys);
                 });
             }
             req.cnn.release();
          });
      }

      else {
         req.cnn.chkQry('select id, fname, lname, pos1, height, weight, team '
          + 'from Player where pos1 = ?', [req.query.position],
          function(err, plys) {
             if (!err) {
                res.status(200).json(plys);
             }
            req.cnn.release();
          });
      }
   }

   else {
      if (req.query.lobby) {
         req.cnn.chkQry('select id, fname, lname, pos1, height, weight, team'
          + ' from Player', null, function(err, plys) {
             if (!err) {
                savedPlys = plys;
                req.cnn.chkQry('select player1, player2, player3, player4, '
                 + 'player5, player6, player7 from Team where lobbyId = ?',
                 [req.query.lobby], function(err, tms) {
                    removePlayers(req, res, err, tms, savedPlys);
                 });
             }
             req.cnn.release();
          });
      }

      else {
         req.cnn.chkQry('select id, fname, lname, pos1, height, weight, team '
          + 'from Player', null, function(err, plys) {
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
    'from Player where id = ?';

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
