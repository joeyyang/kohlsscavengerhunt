var myApp = angular.module('kohlsApp', []).config(function($routeProvider, $locationProvider) {
  $routeProvider
  .when('/', {controller: "landingController", templateUrl: "templates/landing.html"})
  .when('/howToPlay', {controller: "howToPlayController", templateUrl: "templates/howToPlay.html"})
  .when('/hunt', {controller: "huntController", templateUrl: "templates/hunt.html"})
  .when('/result', {controller: "resultController", templateUrl: "templates/result.html"})
  .when('/stash', {controller: "stashController", templateUrl: "templates/stash.html"})
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

  service.firebase = new Firebase("https://kohlsscavengerhunt.firebaseio.com/");

  service.data = {
    zipCode: ""
  };

  return service;
})

.factory('storageService', function() {
  return {
    success: false,
    roundEnd: 0,
    nextRound: 0,
    item: {},
    savedCoupons: {},
    resultData: null
  };
})

.factory('timeService', function() {
  var service = {};

  service.formatTime = function (seconds) {
    var m = ("0" + (~~(seconds/60)).toString()).slice(-2);
    var s = ("0" + (seconds % 60).toString()).slice(-2);
    return m + ":" + s;
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

  service.getRoundData = function(success) {
    var d = $q.defer();
    $http({
      url: "/getRoundData",
      method: "GET",
      params: {
        userData: userService.data,
        success: success
      }
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

  $scope.login = function() {
    var auth = new FirebaseSimpleLogin(userService.firebase, function(error, user) {
      if (error) {
        console.log("OMG ABORT ABORT WHY DID I DO THAT???: " + error);
      } else if (user) {
        getZip(function (zip) { userService.data.zipCode = zip; });
        console.log(user);
        userService.data.name = user.id;
        userService.data.gender = (Math.random() < 0.5 ? "male" : "female");
        userService.data.age = (Math.floor(Math.random()*80));
        $location.path('/howToPlay');
      } else {
        $location.path('/');
      }
    });
    auth.login('facebook');
  };

})

.controller("howToPlayController", function($location, $scope) {

  $scope.play = function() {
    $location.path('/hunt');
  };

})

.controller("huntController", function(timeService, reqsService, storageService, $location, $scope) {

  var seconds;
  var countdown;

  storageService.resultData = null;

  reqsService.getItem().then(
    function (data) {
      roundEnd = new Date(data.roundEnd);

      // Hack to display item titles correctly.
      var div = document.createElement('div');
      div.innerHTML = data.item.title;
      data.item.title = div.childNodes[0].nodeValue;

      storageService.nextRound = new Date(data.nextRound);
      storageService.item = data.item;
      $scope.item = data.item;
      console.log(data.item.upc);
      seconds = Math.floor((roundEnd - new Date())/1000);
      $scope.time = timeService.formatTime(seconds);

      countdown = setInterval(function() {
        $scope.$apply(function() {
          if (seconds > 0) {
            seconds--;
            $scope.time = timeService.formatTime(seconds);
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
          clearInterval(countdown);
          $location.path('/result');
      } else {
        $scope.error = true;
      }
      $scope.guess = "";
    }
  };

})

.controller("resultController", function(timeService, reqsService, storageService, $location, $scope) {
  if (storageService.resultData === null) {
    console.log("Sending get request for round data.");
    reqsService.getRoundData(storageService.success).then(
      function (data){
        storageService.resultData = data;
        $scope.result = data;
      },
      function (err) {
        $scope.result = {
          place: ['?', '?']
        };
      }
    );
  } else {
    $scope.result = storageService.resultData;
  }

  $scope.saved = !!storageService.savedCoupons[storageService.item.title];

  $scope.coupon = storageService.item.coupon;
  $scope.success = storageService.success;
  var seconds = Math.floor((storageService.nextRound - new Date())/1000);
  $scope.time = timeService.formatTime(seconds);

  var countdown = setInterval(function() {
    $scope.$apply(function() {
      if (seconds > 0) {
        seconds--;
        $scope.time = timeService.formatTime(seconds);
      } else {
        clearInterval(countdown);
        $scope.nextRoundStarted = true;
      }
    });
  }, 1000);

  $scope.toggleCoupon = function() {
    if ($scope.saved) {
      delete storageService.savedCoupons[storageService.item.title];
    } else {
      storageService.savedCoupons[storageService.item.title] = storageService.item.coupon;
    }
    $scope.saved = !$scope.saved;
    console.log(storageService.savedCoupons);
  };

  $scope.playAgain = function() {
    if (seconds > 0) {
      $scope.waiting = true;
      setTimeout(function(){
        $location.path('/hunt');
        $scope.waiting = false;
      }, seconds*1000);
    } else {
      $location.path('/hunt');
    }
  };
})

.controller("waitingController", function(timeService, storageService, $location, $scope) {
  var seconds = Math.floor((storageService.nextRound - new Date())/1000);
  $scope.time = timeService.formatTime(seconds);
  var countdown = setInterval(function() {
    $scope.$apply(function() {
      if (seconds > 0) {
        seconds--;
        $scope.time = timeService.formatTime(seconds);
      } else {
        clearInterval(countdown);
        $location.path("/hunt");
      }
    });
  }, 1000);
})

.controller("stashController", function($location, $scope, storageService) {

  stash = [];
  for (var title in storageService.savedCoupons) {
    stash.push({title: title, coupon: storageService.savedCoupons[title]});
  }
  $scope.stash = stash;

  $scope.back = function() {
    window.history.back();
  };
});




