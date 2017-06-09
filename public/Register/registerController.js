app.controller('registerController',
 ['$scope', '$rootScope', '$state', '$http', 'notifyDlg', 'terms', '$interval',
 function($scope, $rootScope, $state, $http, nDlg, terms, $interval) {

   $scope.num = 0;
   $scope.errors = [];

   $scope.increaseNum = function() {
      $scope.num++;
   };

   $interval($scope.increaseNum, 1000);

   $scope.showTerms = function() {
      nDlg.show($scope, terms.TERMS,
       "Terms and Conditions");
   };

   $scope.registerUser = function() {
      $scope.lang = $rootScope.lang;
      $http.post("Prss", $scope.user)
      .then(function() {
         return nDlg.show($scope, "Registration succeeded.  Login " +
          "automatically?",
          "Login", ["Yes", "No"]);
      })
      .then(function(btn) {
         if (btn === "Yes")
            return $http.post("Ssns", $scope.user);
         else {
            $state.go('home');
         }
      })
      .then(function(response) {
         var location = response.headers().location.split('/');
         return $http.get("Ssns/" + location[location.length - 1]);
      })
      .then(function(response) {
         return $http.get('/Prss/' + response.data.prsId);
      })
      .then(function(response) {
         $rootScope.user = response.data[0];
         $state.go('home');
       })
      .catch(function(err) {
         $scope.errors = err.data;
      });
   };

   $scope.quit = function() {
      $state.go('home');
   };
}]);
