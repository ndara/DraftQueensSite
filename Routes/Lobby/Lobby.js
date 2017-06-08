var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
var mysql = require('mysql');

router.baseURL = '/Lobbies';

router.get('/', function(req, res) {
   var query = 'select id, name, ownerId, guestId, turn from Lobby where ' +
    'ownerId = ? or guestId = ?';
   var noPrm = 'select id, name, ownerId, guestId, turn from Lobby';

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
   var insertQuery = "insert into Lobby (name, ownerId) values (?, ?)";
   async.waterfall([
   function(cb) {
      if (vld.hasFields(body, ["name"], cb) 
       && vld.check(body.name.length <= 127, Tags.badValue, ["name"], cb)) {
         cnn.chkQry(nameQuery, body.name, cb);
      }
   },
   
   function(existingName, fields, cb) {
      if (vld.check(!existingName.length, Tags.dupName, null, cb)) {
         cnn.chkQry(insertQuery, [body.name, req.session.id], cb);
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
   var query = 'select id, name, ownerId, guestId, turn '
    + 'from Lobby where id = ?';

   req.cnn.chkQry(query, [req.params.lobbyId],
    function(err, lbys) {
       if (lbys.length) {
          res.status(200).json(lbys[0]);
       }

       else {
          req.validator.check(false, Tags.notFound, null, null);
       }

       req.cnn.release();
   });
});

var noPropReturner = function(req, res) {
   if (!req.body.hasOwnProperty("name")
    && !req.body.hasOwnProperty("guestId")) {
      req.validator.check(false, Tags.missingField, ["name", "guestId"]);
      req.cnn.release();
      return false;
   }
   return true;
};

router.put('/:lobbyId', function(req, res) {
   var vld = req.validator;
   var id = req.params.lobbyId;
   var multiSelQry = 'select * from Lobby where id <> ? and name = ?';

   if (!noPropReturner(req, res)) {
      return false;
   }

   if (req.body.hasOwnProperty("name")) {
      async.waterfall([
      function(cb) {

         if (vld.check(req.body.name !== "", Tags.badValue, ["name"], cb)
          && vld.hasFields(req.body, ["name"], cb)
          && vld.check(req.body.name.length <= 127,
          Tags.badValue, ["name"], cb)) {
            req.cnn.chkQry('select * from Lobby where id = ?', [id], cb);
         }
      },

      function(lby, fields, cb) {
         if (vld.check(lby.length, Tags.notFound, null, cb)
          && vld.checkPrsOK(lby[0]["ownerId"], cb)) {
            req.cnn.chkQry(multiSelQry, [id, req.body.name], cb);
         }
      },
      
      function(sameName, fields, cb) {
         if (vld.check(!sameName.length, Tags.dupName, null, cb)) {
            req.cnn.chkQry('update Lobby set name = ? where id = ?',
             [req.body.name, id], cb);
         }
      }],

      function(err) {
         if (!err) {
            res.status(200).end();
         }
         req.cnn.release();
      });
   }

   else {
      async.waterfall([
      function(cb) {
         if (vld.check(req.body.guestId && req.body.guestId > 0,
          Tags.notFound, null, cb)) {
            req.cnn.chkQry('select * from Lobby where id = ?', [id], cb);
         }
      },

      function(lby, fields, cb) {
         if (vld.check(lby.length, Tags.notFound, null, cb)
          && vld.checkPrsNotOK(lby[0]["ownerId"], cb)
          && vld.check(!lby[0]["guestId"], Tags.fullLobby, null, cb)) {
            req.cnn.chkQry('select * from Person where id = ?',
             [req.body.guestId], cb);
         }
      },

      function(ids, fields, cb) {
         if (vld.check(ids.length, Tags.notFound, null, cb)) {
            req.cnn.chkQry('update Lobby set guestId = ? where id = ?',
             [req.body.guestId, id], cb);
         }
         else { //need this????
            cb();
         }
      }],

      function(err) {
         if (!err) {
            res.status(200).end();
         }
         req.cnn.release();
      });
   }
});

router.delete('/:lobbyId', function(req, res) {
   var vld = req.validator;
   var cnn = req.cnn;

   var releaseCb = function() {
      cnn.release();
      res.status(200).end();
   };
   
   var prsChecker = function() {
      cnn.chkQry('select * from Lobby where id = ?', [req.params.lobbyId],
       function(err, lbys) {

          if (!vld.check(lbys.length, Tags.notFound, null)) {
             req.cnn.release();
          }

          else if (!vld.check(lbys[0]["turn"] < 0 || lbys[0]["turn"] > 13)
           , Tags.draftInProgress, null) {
             req.cnn.release();
          }

          else {
             if (req.session.id === lbys[0]["ownerId"]) {
                cnn.chkQry('delete from Lobby where id = ?', 
                [req.params.lobbyId], function() {
                    cnn.chkQry('delete from Team where lobbyId = ?',
                     [req.params.lobbyId], releaseCb);
                });
             }

             else if (req.session.id === lbys[0]["guestId"]) {
                cnn.chkQry('update Lobby set guestId = ? where id = ?',
                 [null, req.params.lobbyId], function() {
                    cnn.chkQry('delete from Team where lobbyId = ? and '
                     + 'userId = ?',
                     [req.params.lobbyId, req.session.id], releaseCb);
                 });
             }

             else {
                req.cnn.release();
                vld.checkPrsOK();
             }

          }
       });   
   }();
});

router.post('/:lobbyId/Teams', function(req, res) {
   var vld = req.validator;
   var body = req.body;
   var cnn = req.cnn;

   async.waterfall([
   function(cb) {
      if (vld.hasFields(body, ["name"], cb)) {
         cnn.chkQry('select * from Lobby where id = ?',
          [req.params.lobbyId], cb);
      }
   },

   function(lby, fields, cb) {
      if (vld.check(lby.length, Tags.notFound, null, cb)
       && vld.checkPrssOK(lby[0]["ownerId"], lby[0]["guestId"], cb)) {
         cnn.chkQry('select * from Team where lobbyId = ? and userId = ?',
          [req.params.lobbyId, req.session.id], cb); //old: lby[0]["ownerId"]
      }
   },

   function(dupTms, fields, cb) {
      if (vld.check(!dupTms.length, Tags.dupTeam, null, cb)) {
         cnn.chkQry('select * from Team where name = ?', [req.body.name], cb);
      }
   },

   function(dupName, fields, cb) {
      if (vld.check(!dupName.length, Tags.dupName, null, cb)) {
         cnn.chkQry('insert into Team (name, userId, lobbyId) '
          + 'values (? , ?, ?)', [req.body.name, req.session.id, 
          req.params.lobbyId], cb);
      }
   },

   function(insRes, fields, cb) { //right way of doing this???
      res.location(router.baseURL + '/' + insRes.insertId).end();
      cb();
   }],

   function() {
      cnn.release();
   });
});

router.get('/:lobbyId/Teams', function(req, res) {
   var vld = req.validator;
   var body = req.body;

   async.waterfall([
   function(cb) {
      req.cnn.chkQry('select * from Lobby where id = ?',
       [req.params.lobbyId], cb);
   },

   function(lby, fields, cb) {
      if (vld.check(lby.length, Tags.notFound, null, cb)) {
         req.cnn.chkQry('select * from Team where lobbyId = ?',
          [req.params.lobbyId], cb)
      }
   },

   function(tms, fields, cb) {
      res.json(tms);
      cb();
   }],

   function() {
      req.cnn.release();
   });
});


module.exports = router;
