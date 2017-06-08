app.controller('tabController',
 ['$scope',
 function($scope) {
   $scope.tab = 1;

   $scope.setTab = function(newTab) {
      $scope.tab = newTab;
   };

   $scope.isSet = function(tabIdx) {
      return $scope.tab === tabIdx;
   };

}]);
