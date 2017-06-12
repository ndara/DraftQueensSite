app.config(['$stateProvider', '$urlRouterProvider',
 function($stateProvider, $router) {

   $router.otherwise("/");

   $stateProvider
   .state('home', {
      url: '/',
      templateUrl: 'Home/home.template.html',
      controller: 'homeController',
   })
   .state('login', {
      url: '/login',
      templateUrl: 'Login/login.template.html',
      controller: 'loginController',
   })
   .state('register', {
      url: '/register',
      templateUrl: 'Register/register.template.html',
      controller: 'registerController',
   })
   .state('lobbies', {
      url: '/lobbies',
      templateUrl: 'Lobby/lobby.template.html',
      controller: 'lobbyController',
      resolve: {
         lobbies: ['$q', '$http', function($q, $http) {
            return $http.get('/Lobbies')
            .then(function(response) {
               return response.data;
            });
         }]
      }
   })
   .state('draft', {
      url: '/lobbies/:lobbyId',
      templateUrl: 'Lobby/draft.template.html',
      controller: 'draftController',
      resolve: {
         turn: ['$q', '$http', '$stateParams',
          function($q, $http, $stateParams) {
            return $http.get('/Lobbies/' + $stateParams.lobbyId)
            .then(function(response) {
               return response.data.turn;
            });
         }],
         teams: ['$q', '$http', '$stateParams',
          function($q, $http, $stateParams) {
            return $http.get('/Lobbies/' + $stateParams.lobbyId + '/Teams')
            .then(function(response) {
               console.log("number of teams: " + response.data.length);
               return response.data;
            });
         }],
         qbs: ['$q', '$http', '$stateParams', function($q, $http, $stateParams) {
            return $http.get('/Players/?position=QB&lobby=' + $stateParams.lobbyId)
            .then(function(response) {
               console.log("number of qbs: " + response.data.length);
               return response.data;
            });
         }],
         wrs: ['$q', '$http', '$stateParams', function($q, $http, $stateParams) {
            return $http.get('/Players/?position=WR&lobby=' + $stateParams.lobbyId)
            .then(function(response) {
               console.log("number of wrs: " + response.data.length);
               return response.data;
            });
         }],
         rbs: ['$q', '$http', '$stateParams', function($q, $http, $stateParams) {
            return $http.get('/Players/?position=RB&lobby=' + $stateParams.lobbyId)
            .then(function(response) {
               console.log("number of rbs: " + response.data.length);
               return response.data;
            });
         }],
         tes: ['$q', '$http', '$stateParams', function($q, $http, $stateParams) {
            return $http.get('/Players/?position=TE&lobby=' + $stateParams.lobbyId)
            .then(function(response) {
               console.log("number of tes: " + response.data.length);
               return response.data;
            });
         }]
      }
   });
}]);
