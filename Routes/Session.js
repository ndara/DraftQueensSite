// This middleware assumes cookieParser has been "used" before this

var crypto = require('crypto');

var sessions = {};          // All currently logged-in Sessions
var duration = 7200000;     // Two hours in milliseconds
var cookieName = 'CHSAuth'; // Cookie key for authentication tokens

// Session-constructed objects represent an ongoing login session, including
// user details, login time, and time of last use, the latter for the purpose
// of timing-out sessions that have been unused for too long.
var Session = function Session(user) {
   this.firstName = user.firstName;
   this.lastName = user.lastName;
   this.id = user.id;
   this.email = user.email;

   this.loginTime = new Date().getTime();
   this.lastUsed = new Date().getTime();
};


// Export function that logs in user by creating authToken and sending back
// as a cookie, creating Session for |user|, and saving in |sessions| indexed
// by the authToken.
//
// 1 Cookie tagged by |cookieName| times out on client side after |duration|
// (though the router, below, will check to prevent hacking), and will not be
// shown by the browser to the user, again to prevent hacking.
exports.makeSession = function makeSession(user, res) {
   var authToken = crypto.randomBytes(16).toString('hex'); //Create auth toke
   var session = new Session(user);

   res.cookie(cookieName, authToken, {maxAge: duration, httpOnly: true}); //1
   sessions[authToken] = session;

   return authToken;
};

// Export a function to log out a user, given an authToken
exports.deleteSession = function(authToken) {
   delete sessions[authToken];
};

// Export router to find any Session associated with |req|, based on cookies,
// delete Session if it has timed out, or attach Session to |req| if current
// If |req| has attached Session after process, then down-chain routes will
// treat |req| as logged-in.
exports.router = function(req, res, next) {
   // If we present a session cookie that corresponds with one in |sessions|
   if (req.cookies[cookieName] && sessions[req.cookies[cookieName]]) {
      // If the session was last used more than |duration| mS ago..
      if (sessions[req.cookies[cookieName]]
       .lastUsed < new Date().getTime() - duration) {
         delete sessions[req.cookies[cookieName]];
      }

      else {
         req.session = sessions[req.cookies[cookieName]];
      }
   }

   next();
};

exports.cookieName = cookieName;
exports.sessions = sessions;
