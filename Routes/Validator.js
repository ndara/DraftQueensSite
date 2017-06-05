// Create a validator that draws its session from |req|, and reports
// errors on |res|
var Validator = function(req, res) {
   this.errors = [];   // Array of error objects having tag and params
   this.session = req.session;
   this.res = res;
};

// List of errors, and their corresponding resource string tags
Validator.Tags = {
   noLogin: "noLogin",              // No active session/login
   noPermission: "noPermission",    // Login lacks permission.
   missingField: "missingField",    // Field missing from request.
   badValue: "badValue",            // Field has bad value.
   notFound: "notFound",            // Entity not present in DB
   badLogin: "badLogin",            // Email/password combination invalid
   dupEmail: "dupEmail",            // Email duplicates an existing email
   noTerms: "noTerms",              // Acceptance of terms is required.
   forbiddenRole: "forbiddenRole",  // Cannot set to this role
   noOldPwd: "noOldPwd",            // Change of password requires
   dupName: "dupTitle",             // Name duplicate an existing name
   dupEnrollment: "dupEnrollment",  // Duplicate enrollment
   queryFailed: "queryFailed",      // Query failed to complete
   oldPwdMismatch: "oldPwdMismatch",// Old password does not match password
   forbiddenField: "forbiddenField" // Field is not allowed
};

// Check |test|.  If false, add an error with tag and possibly empty array
// of qualifying parameters, e.g. name of missing field if tag is
// Tags.missingField.
//
// Regardless, check if any errors have accumulated, and if so, close the
// response with a 400 and a list of accumulated errors, and throw
//  this validator as an error to |cb|, if present.  Thus,
// |check| may be used as an "anchor test" after other tests have run w/o
// immediately reacting to accumulated errors (e.g. checkFields and chain)
// and it may be relied upon to close a response with an appropriate error
// list and call an error handler (e.g. a waterfall default function),
// leaving the caller to cover the "good" case only.
Validator.prototype.check = function(test, tag, params, cb) {
   if (!test)
      this.errors.push({tag: tag, params: params});

   if (this.errors.length) {
      if (this.res) {

         if (this.errors[0].tag === Validator.Tags.noPermission) {
            this.res.status(403).end();
         }

         else {
            this.res.status(400).json(this.errors);
         }

         this.res = null;   // Preclude repeated closings
      }

      if (cb) {
         cb(this);
      }

   }
   return !this.errors.length;
};

// Somewhat like |check|, but designed to allow several chained checks
// in a row, finalized by a check call.
Validator.prototype.chain = function(test, tag, params) {
   if (!test) {
      this.errors.push({tag: tag, params: params});
   }

   return this;
};


// Validate that AU is the specified person or is an admin
Validator.prototype.checkPrsOK = function(prsId, cb) {

   return this.check(this.session &&
    (this.session.id == prsId),
    Validator.Tags.noPermission, null, cb);
};

// Check presence of truthy property in |obj| for all fields in fieldList
Validator.prototype.hasFields = function(obj, fieldList, cb) {
   var self = this;

   fieldList.forEach(function(name) {
      
      self.chain(obj.hasOwnProperty(name) 
       && (typeof(obj[name]) !== "string" || 
       (typeof(obj[name]) === "string" && obj[name].length)),
       Validator.Tags.missingField, [name]);
   });

   return this.check(true, null, null, cb);
};

Validator.prototype.hasOnlyFields = function(obj, fieldList, cb) {
   var self = this;
   var badArr = [];

   for (var key in obj) {
      if ((typeof(obj[key]) === "string" && !obj[key].length)
       || fieldList.indexOf(key) === -1) {
         badArr.push(key);
      }
   }

   self.chain(!badArr.length, Validator.Tags.forbiddenField, badArr);
   return this.check(true, null, null, cb);
};

module.exports = Validator;
