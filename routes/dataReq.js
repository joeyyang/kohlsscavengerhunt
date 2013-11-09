var httpGet = require('http-get');
var config = require('../config');
var leaderboard = require('../controllers/leaderboard');
var startOfRound;
var endOfRound;

/////Game Config
var roundLength = 8000;


var state = {
  'currentItem': {
    'male': 0,
    'female': 0
  },
  'currentWinner': {
    'male': "James Bond", 
    'female': "Jenny Bond"
  }
};

exports.getCurrentItem = function(req, res){
  if (req.query.gender === "male"){
    res.writeHead(200);
    res.end(JSON.stringify(state.currentItem.male));
  } else if (req.query.gender === "female"){
    res.writeHead(200);
    res.end(JSON.stringify(state.currentItem.female));
  }
};

exports.checkCurrentItem = function(req, res){
  res.writeHead(200);
  var sendBack = checkWinner(req.data.userData.gender, req.data.guess, req.data.UserData.name);
  sendBack.timeLeft = startOfRound + roundLength;
  res.end(JSON.stringify(sendBack));  
};


var checkWinner = function(gender, guess, name) {
  var sendBack = {};
  if (guess === state.currentItem[gender]) {
    sendBack.correct = true;
    sendBack.winner = currentWinner[gender];
    sendBack.place = [2, 20];                 // hardcoded
    sendBack.couponCode = "youwin";           // hardcoded
    leaderBoard(name, new Date() - startOfRound, gender);
  } else {
    sendBack.correct = false;
    sendBack.winner = currentWinner[gender];
  }
  return sendBack;
};


var determineNextItem = function(){
  var upcMale = [727506537518,
                760925051784,
                786888332067,
                649652095103,
                400932356754];

  var upcFemale = [727506537518,
                  760925051784,
                  786888332067,
                  649652095103,
                  400932356754];


  var randomUPC = upcMale[~~(Math.random()*upcMale.length)];

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
      state.currentItem.male = {
        link: JSON.parse(result.buffer).payload.products[0].images[0].url,
        title: JSON.parse(result.buffer).payload.products[0].productTitle
      }
    }
  });

  var randomUPC = upcFemale[~~(Math.random()*upcFemale.length)];

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
      state.currentItem.female = {
        link: JSON.parse(result.buffer).payload.products[0].images[0].url,
        title: JSON.parse(result.buffer).payload.products[0].productTitle
      }
    }
  });
};


var eventLoop = function(){
  startOfRound = new Date();
  endOfRound = startOfRound + roundLength;
  currentItem = determineNextItem(); 
  setTimeout(eventLoop, roundLength);
};

eventLoop();


