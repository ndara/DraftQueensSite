app.controller('draftController',
 ['$scope', '$state', '$http', '$uibModal', 'notifyDlg',
 'qbs', 'wrs', 'rbs', 'tes', 'teams', '$stateParams', '$interval',
 function($scope, $state, $http, $uibM, nDlg, qbs, wrs, rbs, tes, teams, $stateParams, $interval) {

   $scope.qbs = qbs;
   $scope.wrs = wrs;
   $scope.rbs = rbs;
   $scope.tes = tes;

   $scope.ownerTeam = teams[0];
   $scope.guestTeam = teams[1];

   $scope.stopGetTeams = function() {
      if (angular.isDefined($scope.loopGetTeams)) {
         $interval.cancel($scope.loopGetTeams);
      }
   };

   $scope.getTeams = function() {
      $http.get('/Lobbies/' + $stateParams.lobbyId + '/Teams')
      .then(function(rsp) {
         if (rsp.data[1]) {
            $scope.guestTeam = rsp.data[1];
            $scope.stopGetTeams();
         }
      });
   };

   $scope.loopGetTeams = $interval($scope.getTeams, 3000);


   $scope.addPlayer = function(qb) {
      alert(qb.fname + " " + qb.lname + " in lobby " + $stateParams.lobbyId);
   };

}]);
