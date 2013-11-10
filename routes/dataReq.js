var httpGet = require('http-get');
var config = require('../config');
var leaderboard = require('../controllers/leaderBoard');
var analytics = require('../controllers/analytics');
var startOfRound;

/////Game Config
var roundLength = 20000;
var restLength = 7000;
var startOfRound = null;

var state = {
  'currentItem': {
      link: null,
      title: null,
      upc: null
  },
  'currentWinner': null
};

exports.getCurrentItem = function(req, res){
  leaderboard.addPlayer();
  analytics.add(req.query);
  res.writeHead(200);
  var data = {
    roundEnd: startOfRound + roundLength,
    nextRound: startOfRound + roundLength + restLength,
    item: state.currentItem
  };
  res.end(JSON.stringify(data));
};

exports.getRoundData = function(req, res){
  res.writeHead(200);
  var data = {
    place: leaderboard.results(JSON.parse(req.query.userData))
  };
  res.end(JSON.stringify(data));
};

exports.getWinners = function(req, res) {
  res.writeHead(200);
  res.end(JSON.stringify(leaderboard.getWinners(JSON.parse(req.query).numberOfWinners)));
};

var hashString = function(str){
    var hash = 0, i, char;
    if (str.length == 0) return hash;
    for (i = 0, l = str.length; i < l; i++) {
        char  = str.charCodeAt(i);
        hash  = ((hash<<5)-hash)+char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash.toString().slice(1, 7);
};

var determineNextItem = function(){
  var upc = [727506537518,
            760925051784,
            786888332067,
            649652095103,
            400932356754];

  var randomUPC = upc[~~(Math.random()*upc.length)];
  var options = {url: 'http://qe11-openapi.kohlsecommerce.com/v1/product?upc='+ randomUPC,
                bufferType: "buffer",
                headers: {
                  'X-APP-API_KEY': config['X-APP-API_KEY'],
                  'Accept': 'application/json'
                  }
                };

  httpGet.get(options, function (error, result) {
    if (error) {
      console.error(error);
    } else {
      var product = JSON.parse(result.buffer).payload.products[0];
      state.currentItem = {
        upc: randomUPC,
        link: product.images[0].url,
        title: product.productTitle.replace('&nbsp', ' ').replace('&reg', ''),
        coupon: hashString(product.productTitle).slice(0,8)
      };
    }
  });
};


var eventLoop = function(){
  startOfRound = (new Date())/1;
  state.currentWinner = null;
  leaderboard.newRound();
  determineNextItem();
  setTimeout(eventLoop, roundLength + restLength);
};

eventLoop();


