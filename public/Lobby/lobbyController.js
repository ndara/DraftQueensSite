app.controller('lobbyController',
 ['$scope', '$state', '$http', '$uibModal', 'notifyDlg',
 function($scope, $state, $http, $uibM, nDlg) {

   $scope.lobbies = [{name: "swag"}, {name: "yeet"}, {name: "swervefordaysbruh"}];

   $scope.newLobby = function() {
      $uibM.open({
         templateUrl: 'Lobby/editLobbyDlg.template.html',
         scope: $scope
      }).result
      .then(function(lobbyName) {
         $scope.lobbies.push({name: lobbyName});
      })
      .then(function() {
         $scope.lobbies = $scope.lobbies;
      })
      .catch(function(err) {
         if(err) {
            nDlg.show($scope, "An error occurred...\n" + err, "Error");
         }
      });
   };

}]);
