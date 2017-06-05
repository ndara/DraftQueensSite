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
   });
}]);
