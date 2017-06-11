var app = angular.module('mainApp', [
   'ui.router',
   'ui.bootstrap'
]);

app.constant('terms', {
   'TERMS' : 'These are the terms and conditions...'
});

app.constant("errMap", {
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
      return (err.params && err.params.length ? err.params[0] : "");
   };
}]);

app.directive('posTable', [function() {
   return {
      restrict: 'E',
      templateUrl: 'Lobby/posTable.template.html',
      scope: {
         players: "=",
         addPlayer: "&"
      }
   };
}]);

app.directive('lobbySum', [function() {
   return {
      restrict: 'E',
      templateUrl: 'Lobby/lobbySum.template.html',
      scope: {
         lobby: "=",
         user: "=",
         joinLobby: "&",
         edit: "&",
         delete: "&"
      }
   };
}]);
