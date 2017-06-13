app.controller('lobbyController',
 ['$scope', '$state', '$http', '$uibModal', 'notifyDlg',
 'lobbies', '$interval',
 function($scope, $state, $http, $uibM, nDlg, lobbies, $interval) {

   $scope.lobbies = lobbies;

   $scope.getLobbies = function() {
      $http.get('/Lobbies')
      .then(function(rsp) {
         $scope.lobbies = rsp.data;
      });
   };

   $interval($scope.getLobbies, 2000);


   $scope.joinLobby = function(lobby) {
      var selectedName;
      $scope.dlgTitle = "Join Lobby";

      if ($scope.user.id === lobby.guestId
       || $scope.user.id === lobby.ownerId) {
         $state.go('draft', ({lobbyId: lobby.id}));
      }
      else if (lobby.guestId) {
         nDlg.show($scope,
          "Sorry, this lobby's full, please choose another", "Error");
      }
      else {
         $uibM.open({
            templateUrl: 'Lobby/joinLobbyDlg.template.html',
            scope: $scope
         }).result
         .then(function(teamName) {
            selectedName = teamName;
            return $http.put('/Lobbies/' + lobby.id,
             {guestId: $scope.user.id});
         })
         .then(function() {
            return $http.post('/Lobbies/' + lobby.id + '/Teams',
             {name: selectedName});
         })
         .then(function() {
            $state.go('draft', ({lobbyId: lobby.id}));
         })
         .catch(function(err) {
            if (err) {
               $http.delete('/Lobbies/' + lobby.id);
               nDlg.show($scope, selectedName +
                " already exists. Please join again with a unique name",
                "Error");
            }
         });
      }
   };

   $scope.newLobby = function() {
      $scope.dlgTitle = "New Lobby";
      var selectedTeamName, selectedLobbyName, lobbyId;

      $uibM.open({
         templateUrl: 'Lobby/createLobbyDlg.template.html',
         scope: $scope
      }).result
      .then(function(lobby) {
         selectedLobbyName = lobby.lobbyName;
         selectedTeamName = lobby.teamName;
         return $http.post('/Lobbies', {name: lobby.lobbyName});
      })
      .then(function(response) {
         var loc = response.headers().location.split('/');

         lobbyId = loc[loc.length - 1];
         return $http.post('/Lobbies/' + lobbyId + '/Teams',
          {name: selectedTeamName});
      })
      .then(function(response) {
         return $http.get('/Lobbies');
      })
      .then(function(rsp) {
         $scope.lobbies = rsp.data;
      })
      .catch(function(err) {
         if(err) {
            nDlg.show($scope, "Another lobby and/or team already has the " +
             'name you specified', "Error");
            $http.delete('/Lobbies/' + lobbyId);
         }
      });
   };

   $scope.edit = function(index) {
      $scope.dlgTitle = 'Edit Lobby Name';
      $uibM.open({
         templateUrl: 'Lobby/editLobbyDlg.template.html',
         scope: $scope
      }).result
      .then(function(lobbyName) {
         selectedTitle = lobbyName;
         return $http.put('/Lobbies/' + lobbies[index].id, {name: lobbyName});
      })
      .then(function() {
         return $http.get('/Lobbies');
      })
      .then(function(rsp) {
         $scope.lobbies = rsp.data;
      })
      .catch(function(err) {
         if (err) {
            nDlg.show($scope, "Another lobby already has title " +
             selectedTitle, "Error");
         }
      });
   };

   $scope.delete = function(index) {
      $scope.dlgTitle = 'Delete Lobby';
      nDlg.show($scope, "Are you sure you want to delete this lobby?",
       "Confirm Delete", ["Delete", "Cancel"])
      .then(function(btn) {
         if (btn === "Delete") {
            $http.delete("Lobbies/" + $scope.lobbies[index].id);
            $scope.lobbies.splice(index, 1);
         }
      })
      .catch(function(err) {
         if (err) {
            nDlg.show($scope, "Cannot delete when draft is in progress ",
             "Error");
         }
      });
   };
}]);
