var httpGet = require('http-get');
var config = require('../config');
var leaderboard = require('../controllers/leaderboard');
var startOfRound;

/////Game Config
var roundLength = 20000;


var state = {
  'currentItem': {
    'male': {
      link: null,
      title: null,
      upc: null
    },
    'female': {
      link: null,
      title: null,
      upc: null
    }
  },
  'currentWinner': {
    'male': "James Bond", 
    'female': "Jenny Bond"
  }
};

exports.getWinners = function(req, res){
  res.writeHead(200);
  res.end(JSON.stringify(leaderboard(getWinners(req.body.numberOfWinners))));
};

exports.getCurrentItem = function(req, res){
  if (req.query.userData.gender === "male"){
    res.writeHead(200);
    res.end(JSON.stringify(state.currentItem.male));
  } else if (req.query.userData.gender === "female"){
    res.writeHead(200);
    res.end(JSON.stringify(state.currentItem.female));
  } else{
    res.writeHead(200);
    res.end(JSON.stringify(state.currentItem.male));
  }
};

exports.checkCurrentItem = function(req, res){
  res.writeHead(200);
  var sendBack = checkWinner(req.body.userData.gender, req.body.guess, req.body.userData.name);
  sendBack.endOfRound = startOfRound + roundLength;
  res.end(JSON.stringify(sendBack));  
};


var checkWinner = function(gender, guess, name) {
  var sendBack = {};
  console.log(state.currentItem[gender].upc)
  if (parseInt(guess) === state.currentItem[gender].upc) {
    sendBack.correct = true;
    // sendBack.winner = state.currentWinner[gender];
    sendBack.place = [2, 20];                 // hardcoded
    sendBack.couponCode = "youwin";           // hardcoded
    leaderboard.addWinner(name, new Date() - startOfRound, gender);
  } else {
    sendBack.correct = false;
    sendBack.winner = state.currentWinner[gender];
  }
  console.log(sendBack);
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


  var randomUPCMale = upcMale[~~(Math.random()*upcMale.length)];

  var options = {url: 'http://qe11-openapi.kohlsecommerce.com/v1/product?upc='+ randomUPCMale,
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
        upc: randomUPCMale,
        link: JSON.parse(result.buffer).payload.products[0].images[0].url,
        title: JSON.parse(result.buffer).payload.products[0].productTitle
      }
    }
  });

  var randomUPCFemale = upcFemale[~~(Math.random()*upcFemale.length)];

  var options = {url: 'http://qe11-openapi.kohlsecommerce.com/v1/product?upc='+ randomUPCFemale,
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
        upc: randomUPCFemale,
        link: JSON.parse(result.buffer).payload.products[0].images[0].url,
        title: JSON.parse(result.buffer).payload.products[0].productTitle
      }
    }
  });
};


var eventLoop = function(){
  startOfRound = new Date();
  state.currentWinner.male = null;
  state.currentWinner.female = null;
  currentItem = determineNextItem(); 
  setTimeout(eventLoop, roundLength);
};

eventLoop();


