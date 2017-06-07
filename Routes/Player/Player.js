var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
var mysql = require('mysql');

router.baseURL = '/Player';

router.get('/', function(req, res) {
   var query = 'select id, fname, lname, pos1, height, weight, team ' +
    'from Player where pos1 = ?';
   var noPrm = 'select id, fname, lname, pos1, height, weight, team ' +
    'from Player';

   if (req.query.position) {
      req.cnn.chkQry(query, [req.query.position],
      function(err, plys) {

         if (!err) {
            res.status(200).json(plys);
         }
         req.cnn.release();
      });
   }

   else {
      req.cnn.chkQry(noPrm, null,
      function(err, plys) {

         if (!err) {
            res.status(200).json(plys);
         }
         req.cnn.release();
      });
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
