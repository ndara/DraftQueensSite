var Express = require('express');
var Tags = require('../Validator.js').Tags;
var router = Express.Router({caseSensitive: true});
var async = require('async');
var mysql = require('mysql');

router.baseURL = '/Prss';

/*router.get('/', function(req, res) {
   var handler = function(err, prsArr) {
      res.json(prsArr);
      req.cnn.release();
   };

   if (req.query.email) {
      req.cnn.chkQry('select id, email from Person where email like ?',
       [req.query.email + "%"],handler);
   }
 
   else {
      req.cnn.chkQry('select id, email from Person', handler);
   }
});*/

router.post('/', function(req, res) {
   var vld = req.validator;  // Shorthands
   var body = req.body;
   var cnn = req.cnn;

   body.whenRegistered = new Date();

   async.waterfall([
   function(cb) {
      if (vld.hasFields(body,
       ["email", "lastName", "password"], cb) &&
       vld.check(body.termsAccepted, Tags.noTerms, null, cb)) {
         cnn.chkQry('select * from Person where email = ?', body.email, cb);
      }
   },

   function(existingPrss, fields, cb) {
      if (vld.check(!existingPrss.length, Tags.dupEmail, null, cb)) {
         body.termsAccepted = new Date();
         cnn.chkQry('insert into Person set ?', body, cb);
      }
   },

   function(result, fields, cb) {
      res.location(router.baseURL + '/' + result.insertId).end();
      cb();
   }],

   function() {
      cnn.release();
   });
});

router.get('/:id', function(req, res) {
   var vld = req.validator;
   var baseQuery = 'select id, email, firstName, lastName, role, ' +
    'termsAccepted, whenRegistered from Person where id = ?';

   req.cnn.query(baseQuery, [req.params.id],
   function(err, prsArr) {

      if (vld.check(prsArr.length, Tags.notFound)) {
         for (prs in prsArr) {

            if (prsArr[prs]["termsAccepted"] && 
             prsArr[prs]["whenRegistered"]) {
               prsArr[prs]["termsAccepted"] = prsArr[prs]["termsAccepted"]
                .getTime();
               prsArr[prs]["whenRegistered"] = 
                prsArr[prs]["whenRegistered"].getTime();
            }

            else if (!prsArr[prs]["whenRegistered"] 
             && prsArr[prs]["termsAccepted"]) {
               prsArr[prs]["termsAccepted"] = prsArr[prs]["termsAccepted"]
                .getTime();
            }

            else if (!prsArr[prs]["termsAccepted"] && 
             prsArr[prs]["whenRegistered"]) {
               prsArr[prs]["whenRegistered"] = 
                prsArr[prs]["whenRegistered"].getTime();
            }

         }
         res.json(prsArr);
      }
      req.cnn.release();
   });
});

module.exports = router;
