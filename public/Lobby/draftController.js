app.controller('draftController',
 ['$scope', '$state', '$http', '$uibModal', 'notifyDlg',
 'qbs', 'wrs', 'rbs', 'tes', 'teams', '$stateParams', '$interval', 'turn',
 function($scope, $state, $http, $uibM, nDlg, qbs, wrs, rbs, tes, teams, $stateParams, $interval, turn) {

   $scope.qbs = qbs;
   $scope.wrs = wrs;
   $scope.rbs = rbs;
   $scope.tes = tes;

   $scope.ownerTeam = teams[0];
   $scope.guestTeam = teams[1];

   $scope.turn = turn;

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

   $scope.isOwnerTurn = function() {
      return $scope.turn !== null && Math.abs($scope.turn % 2) === 1;
   };

   $scope.isGuestTurn = function() {
      return $scope.turn !== null  && $scope.turn % 2 === 0;
   };

   $scope.isOwner = function() {
      return $scope.user.id === $scope.ownerTeam.userId;
   };

   $scope.isGuest = function() {
      return $scope.user.id === $scope.guestTeam.userId;
   };

   $scope.isMyTurn = function() {
      return ($scope.isOwner() && $scope.isOwnerTurn()) || ($scope.isGuest() && $scope.isGuestTurn());
   };

   $scope.stopUpdateDraft = function() {
      if (angular.isDefined($scope.loopUpdateDraft)) {
         $interval.cancel($scope.loopUpdateDraft);
      }
   };

   $scope.updateDraft = function() {
      $http.get('/Lobbies/' + $stateParams.lobbyId)
      .then(function(rsp) {
         $scope.turn = rsp.data.turn;

         if ($scope.isDraftComplete()) {
            $scope.turn = null;
            $scope.stopUpdateDraft();
         }
         return $http.get('/Players/?position=QB&lobby=' + $stateParams.lobbyId);
      })
      .then(function(rsp) {
         $scope.qbs = rsp.data;
         return $http.get('Players/?position=RB&lobby=' + $stateParams.lobbyId);
      })
      .then(function(rsp) {
         $scope.rbs = rsp.data;
         return $http.get('Players/?position=WR&lobby=' + $stateParams.lobbyId);
      })
      .then(function(rsp) {
         $scope.wrs = rsp.data;
         return $http.get('Players/?position=TE&lobby=' + $stateParams.lobbyId);
      })
      .then(function(rsp) {
         $scope.tes = rsp.data;
      })
      .catch(function(err) {
         if (err) {
            console.log(err);
         }
      });
   };

   $scope.isDraftComplete = function() {
      return $scope.turn > 13 || $scope.turn === null;
   };

   $scope.loopUpdateDraft = $interval($scope.updateDraft, 500);

   $scope.addPlayer = function(player) {
      if ($scope.isDraftComplete()) {
         nDlg.show($scope, "This draft is complete. No more players may " +
          "be selected. Please join or create a new lobby", "Error");
      }
      else if ($scope.isMyTurn()) {
         $scope.dlgTitle = 'Draft Player';

         nDlg.show($scope, "Are you sure you want to draft " + player.fname + " " + player.lname,
          "Confirm selection", ["Draft!", "Cancel"])
         .then(function(btn) {
            if ($scope.isOwner()) {
               return $http.post("/Teams/" + $scope.ownerTeam.id + "/Players", {playerId: player.id});
            } else {
               return $http.post("/Teams/" + $scope.guestTeam.id + "/Players", {playerId: player.id});
            }
         })
         .catch(function(err) {
            if (err) {
               console.log(err);
            }
         });
      }
      else  {
         nDlg.show($scope, "Please wait. It's not your turn yet. " +
          "Your team name border will change to green when your " +
          "opponent has drafted", "Error");
      }
   };
}]);
