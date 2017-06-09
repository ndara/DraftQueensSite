app.controller('registerController',
 ['$scope', '$state', '$http', 'notifyDlg', 'terms', '$interval',
 function($scope, $state, $http, nDlg, terms, $interval) {

   $scope.num = 0;
   
   $scope.increaseNum = function() {
      $scope.num++;
   }

   $interval($scope.increaseNum, 1000);

   $scope.showTerms = function() {
      nDlg.show($scope, terms.TERMS,
       "Terms and Conditions");
   }

}]);
