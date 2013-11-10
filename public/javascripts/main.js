var myApp = angular.module('kohlsApp', []).config(function($routeProvider, $locationProvider) {
  $routeProvider
  .when('/', {controller: "landingController", templateUrl: "templates/landing.html"})
  .when('/howToPlay', {controller: "howToPlayController", templateUrl: "templates/howToPlay.html"})
  .when('/hunt', {controller: "huntController", templateUrl: "templates/hunt.html"})
  .when('/result', {controller: "resultController", templateUrl: "templates/result.html"})
  .when('/waiting', {controller: "waitingController", templateUrl: "templates/waiting.html"});
})

.config(['$httpProvider', function($httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  }
])

.directive('ngEnter', function() {
  return function(scope, element, attrs) {
    element.bind("keydown keypress", function(event) {
      if(event.which === 13) {
        scope.$apply(function(){
          scope.$eval(attrs.ngEnter);
        });

        event.preventDefault();
      }
    });
  };
})

.factory('userService', function() {
  var service = {};

  // service.firebase = new Firebase("https://kohlsscavengerhunt.firebaseio.com/");

  service.data = {
    zipCode: ""
  };

  return service;
})

.factory('storageService', function() {
  return {
    success: false,
    coupon: "",
    roundEnd: 0,
    nextRound: 0
  };
})

.factory('reqsService', function($q, $http, userService) {

  var service = {};

  service.getItem = function() {
    var d = $q.defer();
    $http({
      url: "/getCurrentItem",
      method: "GET",
      params: {userData: userService.data}
    }).success(function (data) {
      d.resolve(data);
    }).error(function (err) {
      d.reject(err);
    });
    return d.promise;
  };

  service.getRoundData = function() {
    var d = $q.defer();
    $http({
      url: "/getRoundData",
      method: "GET",
      params: {userData: userService.data}
    }).success(function (data) {
      d.resolve(data);
    }).error(function (err) {
      d.reject(err);
    });
    return d.promise;
  };

  return service;
})

.controller("landingController", function(userService, $location, $scope, $http) {

  var getZip = function(cb){
    var lng, lat;
    navigator.geolocation.getCurrentPosition(
    function showPosition(position){
      lat = position.coords.latitude;
      lng = position.coords.longitude;
      $http.get('http://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng + '&sensor=false')
        .success(function(data) {
          var zip = JSON.stringify(data).match(/\"\d{5}\"/g)[0].slice(1, 6);
          cb(zip);
      });
    });
  };

  // $scope.login = function() {
  //   var auth = new FirebaseSimpleLogin(userService.firebase, function() {

  //   });
  // }

  $scope.login = function() {
    getZip(function (zip) { userService.data.zipCode = zip; });
    userService.data.gender = (Math.random() < 0.5 ? "male" : "female");
    userService.data.name = (userService.data.gender === "female" ? "Betsy" : "Johnson");
    userService.data.age = (Math.floor(Math.random()*80));
    $location.path('/howToPlay');
  };

})

.controller("howToPlayController", function($location, $scope) {

  $scope.play = function() {
    $location.path('/hunt');
  };

})

.controller("huntController", function(reqsService, storageService, $location, $scope) {

  reqsService.getItem().then(
    function (data) {
      storageService.roundEnd = new Date(data.roundEnd);
      storageService.nextRound = new Date(data.nextRound);
      storageService.coupon = data.item.coupon;
      $scope.item = data.item;
      console.log(data.item.upc);
      $scope.time = Math.floor((storageService.roundEnd - new Date())/1000);

      var countdown = setInterval(function() {
        $scope.$apply(function() {
          if ($scope.time > 0) {
            $scope.time--;
          } else {
            storageService.success = false;
            clearInterval(countdown);
            $location.path('/result');
          }
        });
      }, 1000);
    },
    function (err) {
      console.log("ERROR ERROR FAIL FAIL PANIC: " + err);
    }
  );

  $scope.error = false;


  $scope.verify = function() {
    if ($scope.guess){
      if($scope.guess === $scope.item.upc.toString()) {
          storageService.success = true;
          $location.path('/result');
      } else {
        $scope.error = true;
      }
      $scope.guess = "";
    }
  };

})

.controller("resultController", function(reqsService, storageService, $location, $scope) {
  reqsService.getRoundData().then(
    function (data){
      $scope.result = data;
    },
    function (err) {
      $scope.result = {
        place: ['?', '?']
      };
    }
  );

  $scope.coupon = storageService.coupon;
  $scope.success = storageService.success;
  $scope.time = Math.floor((storageService.nextRound - new Date())/1000);

  var countdown = setInterval(function() {
    $scope.$apply(function() {
      if ($scope.time > 0) {
        $scope.time--;
      } else {
        clearInterval(countdown);
        $scope.nextRoundStarted = true;
      }
    });
  }, 1000);

  $scope.playAgain = function() {
    if ($scope.time > 0) {
      $location.path('/waiting');
    } else {
      $location.path('/hunt');
    }
  };
})

.controller("waitingController", function(storageService, $location, $scope) {
  $scope.time = Math.floor((storageService.nextRound - new Date())/1000);
  var countdown = setInterval(function() {
    $scope.$apply(function() {
      if ($scope.time > 0) {
        $scope.time--;
      } else {
        clearInterval(countdown);
        $location.path("/hunt");
      }
    });
  }, 1000);
});