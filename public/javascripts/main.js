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

  service.data = {
    zipCode: ""
  };

  return service;
})

.factory('storageService', function() {
  var service = {};

  service.lastResult = {};
  service.times = {};

  service.last = function (value) {
    if (value) {
      service.lastResult = value;
    } else {
      return service.lastResult;
    }
  };

  service.nextRound = function (value) {
    if (value) {
      service.times.nextRound = value;
    } else {
      return service.times.nextRound;
    }
  };

  service.roundEnd = function (value) {
    if (value) {
      service.times.roundEnd = value;
    } else {
      return service.times.roundEnd;
    }
  };

  return service;
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

  service.verify = function(guess) {
    var d = $q.defer();
    $http({
      url: "/guess",
      method: "POST",
      data: {userData: userService.data, guess: guess}
    }).success(function (data) {
      d.resolve(data);
    }).error(function (err) {
      d.reject(err);
    });
    return d.promise;
  };

  service.getWinner = function() {
    var d = $q.defer();
    $http({
      url: "/getWinners",
      method: "GET",
      params: {numberOfWinners: 1}
    }).success(function (data) {
      d.resolve(data[0]);
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
      $http.get('http://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng + '&sensor=true_or_false')
        .success(function(data) {
          console.log("Zip code downloaded.");
          cb(data);
      });
    });
  };

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
      storageService.roundEnd(new Date(data.roundEnd));
      storageService.nextRound(new Date(data.nextRound));
      console.log ("Now: " + new Date()/1000 + ", roundEnd: " + storageService.roundEnd()/1000 + ", nextRound: " + storageService.nextRound()/1000);

      $scope.item = data.item;
      $scope.time = Math.floor((storageService.roundEnd() - new Date())/1000);

      var countdown = setInterval(function() {
        $scope.$apply(function() {
          if ($scope.time > 0) {
            $scope.time--;
          } else {
            storageService.last({correct: false});
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
    if ($scope.guess) {
      reqsService.verify($scope.guess).then(
        function (data) {
          if (data.correct) {
            storageService.last(data);
            $location.path('/result');
          } else {
            $scope.error = true;
          }
        },
        function (err) {
          console.log("ERROR ERROR FAIL FAIL PANIC: " + err);
        }
      );
      $scope.guess = "";
    }
  };

})

.controller("resultController", function(reqsService, storageService, $location, $scope) {
  $scope.result = storageService.last();
  $scope.winner = reqsService.getWinner();
  $scope.time = Math.floor((storageService.nextRound() - new Date())/1000);

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
  $scope.time = Math.floor((storageService.nextRound() - new Date())/1000);
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








