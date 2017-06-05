var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
var mysql = require('mysql');

router.baseURL = '/Lobby';

router.get('/', function(req, res) {
   var query = 'select name, ownerId, guestId, turn from Lobby where ' +
    'ownerId = ? or guestId = ?';
   var noPrm = 'select name, ownerId, guestId, turn from Lobby';

   if (req.query.participantId) {
      req.cnn.chkQry(query, 
      [req.query.participantId, req.query.participantId],
      function(err, lbys) {

         if (!err) {
            res.status(200).json(lbys);
         }
         req.cnn.release();
      });
   }

   else {
      req.cnn.chkQry(noPrm, null,
      function(err, lbys) {

         if (!err) {
            res.status(200).json(lbys);
         }
         req.cnn.release();
      });
   }
});

router.post('/', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;
   var nameQuery = 'select * from Lobby where name = ?';
   var insertQuery = "insert into Lobby (name) values (?)";

   async.waterfall([
   function(cb) {
      if (vld.hasFields(body, ["name"], cb) 
       && vld.check(body.name.length <= 127, Tags.badValue, ["name"], cb)) {
         cnn.chkQry(nameQuery, body.name, cb);
      }
   },
   
   function(existingName, fields, cb) {
      if (vld.check(!existingName.length, Tags.dupname, null, cb)) {
         cnn.chkQry(insertQuery, [body.name], cb);
      }
   },

   function(insRes, fields, cb) {
      res.location(router.baseURL + '/' + insRes.insertId).end();
      cb();
   }],

   function() {
      cnn.release();
   });

});

router.get('/:lobbyId', function(req, res) {
   var query = 'select name, ownerId, guestId, turn from Lobby where id = ?';

   req.cnn.chkQry(query, [req.params.lobbyId],
   function(err, lbys) {
      if (lbys.length) {
         res.status(200).json(lbys[0]);
      }
         
      else {
         req.validator.check(false, Tags.notFound, null);
      }

      req.cnn.release();
   });
});

router.put('/', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;
   var body = req.body;
});



module.exports = router;
/*
router.put('/:cnvId', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnvId = req.params.cnvId;
   var multiSelectQuery = 'select * from Conversation where ' 
    + 'id <> ? && title = ?';
   var updateQuery = "update Conversation set title = ? where id = ?";

   var failure = function(query, cnn, prop) {
      if (body.hasOwnProperty(prop)) {
         return true;
      }

      res.status(500).json('Failed query ' + query);
      cnn.release();
      return false;
   }

   if (!failure(updateQuery, req.cnn, "title")) {
      return false;
   }

   async.waterfall([
   function(cb) {
      if (vld.check(body.title !== "", Tags.badValue, ["title"], cb)
       && vld.hasFields(body, ["title"], cb) &&
       vld.check(body.title.length <= 80, Tags.badValue, ["title"], cb)) {
         req.cnn.chkQry('select * from Conversation where id = ?',
          [cnvId], cb);
      }
   },

   function(cnvs, fields, cb) {
      if (vld.check(cnvs.length, Tags.notFound, null, cb) 
       && vld.checkPrsOK(cnvs[0]["ownerId"], cb)) {
         req.cnn.chkQry(multiSelectQuery, [cnvId, body.title], cb);
      }
   },

   function(sameTtl, fields, cb) {
      if (vld.check(!sameTtl.length, Tags.dupTitle, cb)) {
         req.cnn.chkQry(updateQuery, [body.title, cnvId], cb);
      }

      else {
         cb();
      }
   }],

   function(err) {
      if (!err) {
         res.status(200).end();
         req.cnn.release();
      }

      else {
         req.cnn.release();
      }
   });
});

*/
