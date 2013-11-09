var myApp = angular.module('kohlsApp', []).config(function($routeProvider, $locationProvider) {
  $routeProvider
  .when('/', {controller: "landingController", templateUrl: "templates/landing.html"})
  .when('/howToPlay', {controller: "howToPlayController", templateUrl: "templates/howToPlay.html"})
  .when('/hunt', {controller: "huntController", templateUrl: "templates/hunt.html"})
  .when('/result', {controller: "resultController", templateUrl: "templates/result.html"});
})

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

  service.data = {};

  return service;
})

.factory('resultService', function() {
  var service = {};

  service.lastResult = {};

  service.last = function (value) {
    if (value) {
      return service.lastResult;
    } else {
      service.lastResult = value;
    }
  };

  return service;
})

.factory('reqsService', function($q, $http, userService) {

  var service = {};

  service.getItem = function() {
    console.log("Sending request for item.");
    var d = $q.defer();
    $http({
      url: "/getCurrentItem",
      method: "GET",
      params: {userData: userService.data}
    }).success(function (data) {
      console.log("Retrieved data from get request!");
      d.resolve(data);
    }).error(function (err) {
      d.reject(err);
    });
    return d.promise;
  };

  service.verify = function(guess) {
    console.log("Sending guess.");
    var d = $q.defer();
    $http({
      url: "/guess",
      method: "POST",
      data: {userData: userService.data, guess: guess}
    }).success(function (data) {
      console.log("Retrieved data from post request!");
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
      console.log("Retrieved data from get request!");
      d.resolve(data);
    }).error(function (err) {
      d.reject(err);
    });
    return d.promise;
  };

  return service;
})

.controller("landingController", function(userService, $location, $scope) {

  $scope.login = function() {
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

.controller("huntController", function(reqsService, resultService, $location, $scope) {

  reqsService.getItem().then(
    function (data) {
      console.log("retrieved items");
      var roundEnd = new Date(data.roundEnd);
      $scope.item = data.item;
      $scope.time = Math.floor((new Date() - roundEnd)/1000);

      console.log (roundEnd, $scope.time);

      var countdown = setInterval(function() {
        $scope.time--;
      }, 1000);

      setTimeout(function() {
        resultService.last({correct: false});
        clearInterval(countdown);
        $location.path('/result');
      }, 1000 * $scope.time + 500);
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
            console.log('HOLY SHIT I WON');
            resultService.last(data);
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

.controller("resultController", function(reqsService, resultService, $location, $scope) {
  $scope.result = resultService.last();
  $scope.winner = reqsService.getWinner();
  $scope.result.time = 10;

  $scope.playAgain = function() {
    $location.path('/hunt');
  };
});



var getZip = function(){
  var lng, lat;
  navigator.geolocation.getCurrentPosition(
    function showPosition(position){
      lat = position.coords.latitude;
      lng = position.coords.longitude;
      $http.get('http://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng + '&sensor=true_or_false')
        .success(function(data) {
          console.log(data);
      })
    })
};








