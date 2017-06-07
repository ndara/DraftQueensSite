app.controller('lobbyController',
 ['$scope', '$state', '$http', '$uibModal', 'notifyDlg',
 function($scope, $state, $http, $uibM, nDlg) {

   $scope.lobbies = [{name: "swag", id: 1}, {name: "yeet", id: 2}, {name: "swervefordaysbruh", id: 3}];

   $scope.joinLobby = function(lobbyId) {
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
      })
      .catch(function(err) {
         if (err) {
            nDlg.show($scope, "An error occurred...\n" + err, "Error");
         }
      });
   };

   $scope.newLobby = function() {
      $uibM.open({
         templateUrl: 'Lobby/editLobbyDlg.template.html',
         scope: $scope
      }).result
      .then(function(lobbyName) {
         // TODO: Post a lobby to server
         $scope.lobbies.push({name: lobbyName});
      })
      .then(function() {
         // TODO: Pull all lobbies from server 
         $scope.lobbies = $scope.lobbies;
      })
      .catch(function(err) {
         if(err) {
            nDlg.show($scope, "An error occurred...\n" + err, "Error");
         }
      });
   };

}]);
