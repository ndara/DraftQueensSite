app.controller('draftController',
 ['$scope', '$state', '$http', '$uibModal', 'notifyDlg',
 'qbs', 'wrs', 'rbs', 'tes', 'teams', '$stateParams', '$interval', 'turn',
 function($scope, $state, $http, $uibM, nDlg, qbs, wrs, rbs, tes, teams, $stateParams, $interval, turn) {

   $scope.qbs = qbs;
   $scope.wrs = wrs;
   $scope.rbs = rbs;
   $scope.tes = tes;
   $scope.numPlayers = 7;

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
      console.log("user: " + $scope.user.id);
      console.log("owner: " + $scope.ownerTeam.userId);
      return $scope.user.id === $scope.ownerTeam.userId;
   };

   $scope.isGuest = function() {
      console.log("user: " + $scope.user.id);
      if ($scope.guestTeam)
         console.log("guest: " + ($scope.guestTeam && $scope.guestTeam.userId));
      return $scope.user.id === $scope.guestTeam && $scope.guestTeam.userId;
   };

   $scope.isMyTurn = function() {
      return ($scope.isOwner() && $scope.isOwnerTurn()) || ($scope.isGuest() && $scope.isGuestTurn());
   };

   $scope.stopUpdateDraft = function() {
      if (angular.isDefined($scope.loopUpdateDraft)) {
         $interval.cancel($scope.loopUpdateDraft);
      }
   };

   $scope.updateTeamPlayers = function(team, plyIds) {
      var plys = [];

      if (plyIds[0]) {
         $http.get('/Players/' + plyIds[0])
         .then(function(rsp) {
            plys.push(rsp.data);

            if (plyIds[1]) {
               return $http.get('/Players/' + plyIds[1]);
            }
         })
         .then(function(rsp) {
            if (rsp) {
               plys.push(rsp.data);

               if (plyIds[2]) {
                  return $http.get('/Players/' + plyIds[2]);
               }
            }
         })
         .then(function(rsp) {
            if (rsp) {
               plys.push(rsp.data);

               if (plyIds[3]) {
                  return $http.get('/Players/' + plyIds[3]);
               }
            }
         })
         .then(function(rsp) {
            if (rsp) {
               plys.push(rsp.data);

               if (plyIds[4]) {
                  return $http.get('/Players/' + plyIds[4]);
               }
            }
         })
         .then(function(rsp) {
            if (rsp) {
               plys.push(rsp.data);

               if (plyIds[5]) {
                  return $http.get('/Players/' + plyIds[5]);
               }
            }
         })
         .then(function(rsp) {
            if (rsp) {
               plys.push(rsp.data);

               if (plyIds[6]) {
                  return $http.get('/Players/' + plyIds[6]);
               }
            }
         })
         .then(function(rsp) {
            team.players = plys;
         })
         .catch(function(err) {
            console.log('err: ' + err.data);
         });
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
         return $http.get('Teams/' + $scope.ownerTeam.id + '/Players');
      })
      .then(function(rsp) {
         $scope.updateTeamPlayers($scope.ownerTeam, rsp.data);
         // $scope.ownerTeam.players = rsp.data;
         // console.log("number of players on owner team: " + rsp.data.length)

         if ($scope.guestTeam) {
            return $http.get('Teams/' + $scope.guestTeam.id + '/Players');
         }
      })
      .then(function(rsp) {
         if ($scope.guestTeam)
            $scope.updateTeamPlayers($scope.guestTeam, rsp.data);
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
            if (btn == "Draft!") {
               if ($scope.isOwner()) {
                  return $http.post("/Teams/" + $scope.ownerTeam.id + "/Players", {playerId: player.id});
               } else {
                  return $http.post("/Teams/" + $scope.guestTeam.id + "/Players", {playerId: player.id});
               }
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
