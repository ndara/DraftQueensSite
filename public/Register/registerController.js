app.controller('registerController',
 ['$scope', '$state', '$http', 'notifyDlg', 'terms',
 function($scope, $state, $http, nDlg, terms) {

   $scope.showTerms = function() {
      nDlg.show($scope, terms.TERMS,
       "Terms and Conditions");
   }

}]);
