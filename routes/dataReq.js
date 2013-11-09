var httpGet = require('http-get');
var config = require('../config');
var leaderboard = require('../controllers/leaderBoard');
var startOfRound;

/////Game Config
var roundLength = 10000;
var restLength = 5000;
var startOfRound = null;

var state = {
  'currentItem': {
      link: null,
      title: null,
      upc: null
  },
  'currentWinner': null
};

exports.getWinners = function(req, res){
  res.writeHead(200);
  res.end(JSON.stringify(leaderboard.getWinners(req.query.numberOfWinners)));
};

exports.getCurrentItem = function(req, res){
  res.writeHead(200);
  var data = {
    roundEnd: startOfRound + roundLength,
    nextRound: startOfRound + roundLength + restLength,
    item: state.currentItem
  };
  res.end(JSON.stringify(data));
};

exports.checkCurrentItem = function(req, res){
  res.writeHead(200);
  httpGet.get({
    url: 'http://qe11-openapi.kohlsecommerce.com/v1/recommendation?type=toptrending',
    bufferType: "buffer",
    postalCode: '' + req.body.userData.zipCode,
    headers: {
      'X-APP-API_KEY': config['X-APP-API_KEY'],
      'Accept': 'application/json'
    },
    }, function(error, result) {
      if (error) {
        console.error(error);
      } else {
        var sendBack = checkWinner(req.body.userData.gender, req.body.guess, req.body.userData.name, JSON.parse(result.buffer).payload.recommendations);
        sendBack.endOfRound = startOfRound + roundLength;
        res.end(JSON.stringify(sendBack));
      }
    }
  );
};


var checkWinner = function(gender, guess, name, related) {
  var sendBack = {};
  console.log(state.currentItem.upc);
  if (parseInt(guess) === state.currentItem.upc) {
    sendBack.correct = true;
    sendBack.place = [2, 20];                 // hardcoded
    sendBack.couponCode = "youwin";           // hardcoded
    leaderboard.addWinner(name, new Date() - startOfRound);
    sendBack.related = related;
  } else {
    sendBack.correct = false;
    sendBack.winner = state.currentWinner;
  }
  console.log(sendBack);
  return sendBack;
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
      // console.log(JSON.parse(result.buffer).payload.products[0]);
      state.currentItem = {
        upc: randomUPC,
        link: JSON.parse(result.buffer).payload.products[0].images[0].url,
        title: JSON.parse(result.buffer).payload.products[0].productTitle
      };
    }
  });
};


var eventLoop = function(){
  startOfRound = (new Date())/1;
  state.currentWinner = null;
  determineNextItem();
  setTimeout(eventLoop, roundLength + restLength);
};

eventLoop();


