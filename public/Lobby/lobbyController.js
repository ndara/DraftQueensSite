app.controller('lobbyController',
 ['$scope', '$state', '$http', '$uibModal', 'notifyDlg', 'lobbies',
 function($scope, $state, $http, $uibM, nDlg, lobbies) {

   //$scope.lobbies = [{name: "swag", id: 1}, {name: "yeet", id: 2}, {name: "swervefordaysbruh", id: 3}];
   $scope.lobbies = lobbies;

   $scope.joinLobby = function(lobbyId) {
      $scope.dlgTitle = "Join Lobby";
      $uibM.open({
         templateUrl: 'Lobby/joinLobbyDlg.template.html',
         scope: $scope
      }).result
      .then(function(teamName) {
         // TODO: Post a new team in lobbyId to the server
         console.log(teamName + " playing in lobby " + lobbyId);
      })
      .then(function() {
         // TODO: Do a state.go to the proper lobby
         $state.go('draft', ({lobbyId: lobbyId}));
      })
      .catch(function(err) {
         if (err) {
            nDlg.show($scope, "An error occurred...\n" + err, "Error");
         }
      });
   };

   $scope.newLobby = function() {
      $scope.dlgTitle = "New Lobby";
      var selectedName;

      $uibM.open({
         templateUrl: 'Lobby/editLobbyDlg.template.html',
         scope: $scope
      }).result
      .then(function(lobbyName) {
         selectedTitle = lobbyName;
         return $http.post('/Lobbies', {name: lobbyName});
      })
      .then(function() {
         return $http.get('/Lobbies');
      })
      .then(function(rsp) {
         $scope.lobbies = rsp.data;
      })
      .catch(function(err) {
         if(err) {
            nDlg.show($scope, "Another lobby already has title " +
             selectedTitle + "\n" + err, "Error");
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
         console.log("pressed: " + btn);
         if (btn === "Delete") {
            $http.delete("Lobbies/" + $scope.lobbies[index].id);
            $scope.lobbies.splice(index, 1);
         }
      })
      .catch(function(err) {
         if (err) {
            nDlg.show($scope, "Cannot delete when draft is in progress ", "Error");
         }
      });
   };
}]);
