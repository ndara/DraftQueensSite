var app = angular.module('mainApp', [
   'ui.router',
   'ui.bootstrap'
]);

app.constant("errMap", {
   'TERMS' : 'These are the terms and conditions...',
   missingField: 'Field missing from request: ',
   badValue: 'Field has bad value: ',
   notFound: 'Entity not present in DB',
   badLogin: 'Email/password combination invalid',
   dupEmail: 'Email duplicates an existing email',
   noTerms: 'Acceptance of terms is required',
   noOldPwd: 'Change of password requires an old password',
   oldPwdMismatch: 'Old password that was provided is incorrect.',
   dupTitle: 'Conversation title duplicates an existing one',
   dupName: 'Specified name already exists',
   dupEnrollment: 'Duplicate enrollment',
   forbiddenField: 'Field in body not allowed.',
   queryFailed: 'Query failed (server problem).',
   draftInProgress: 'Request is invalid during a draft',
   playerLimitReached: 'No more players can be added to this team',
   dupTeam: 'A team already exists for the current user in the current lobby',
   fullLobby: 'This lobby has reached its player limit'
});

app.filter('tagError', ['errMap', function(errMap) {
   return function(err) {
      if (err.params) console.log("err: " + err.params[0]);

      if (err.params) err.params[0] = "myErrrr";
      return (err.params && err.params.length ? err.params[0] : "");
   };
}]);
