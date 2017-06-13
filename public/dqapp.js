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

app.constant("teamMap", {
   CLE: 'Cleveland Browns',
   CIN: 'Cincinnati Bengals',
   GB:  'Green Bay Packers',
   KC:  'Kansas City Chiefs',
   JAC: 'Jacksonville Jaguars',
   SF:  'San Francisco 49ers',
   HOU: 'Houston Texans',
   PIT: 'Pittsbirgh Steelers',
   SD:  'San Diego Chargers',
   CAR: 'Carolina Panthers',
   ARI: 'Arizona Cardinals',
   NO:  'New Orleans Saints',
   OAK: 'Oakland Raiders',
   NYG: 'New York Giants',
   CHI: 'Chicago Bears',
   BAL: 'Baltimore Ravens',
   IND: 'Indianapolis Colts',
   TB:  'Tampa Bay Bucaneers',
   WAS: 'Washington Redskins',
   DAL: 'Dallas Cowboys',
   ATL: 'Atlanta Falcons',
   DET: 'Detroit Lions',
   STL: 'St. Louis Rams',
   DEN: 'Denver Broncos',
   NYJ: 'New York Jets',
   MIA: 'Miami Dolphins',
   SEA: 'Seattle Seahawks',
   PHI: 'Philidelphia Eagles',
   NE:  'New England Patriots',
   MIN: 'Minnesota Vikings',
   BUF: 'Buffalo Bills',
   TEN: 'Tennesse Titans'
});

app.filter('nflTeam', ['teamMap', function(teamMap) {
   return function(team) {
      return teamMap[team];
   };
}]);

app.filter('tagError', ['errMap', function(errMap) {
   return function(err) {
      return (errMap[err.tag]
       + (err.params && err.params.length ? err.params[0] : ""));
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
