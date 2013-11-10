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

var grabUPCs = function(){

  for(var i = 0; i < webStoreItems.length; i++){
    httpGet.get({
      url: 'http://qe11-openapi.kohlsecommerce.com/' + webStoreItems[i].links[0].uri+'?skuDetail=true',
      bufferType: "buffer",
      headers: {
        'X-APP-API_KEY': config['X-APP-API_KEY'],
        'Accept': 'application/json'
      },
      }, function(error, result) {
        if (error) {
          console.error(error);
        } else {
          UPCList.push(JSON.parse(result.buffer).payload.products[0].SKUS[0].UPC.ID);
        }
      }
    );
  }
};

var loadItems = function(){
  //this will get hte top 99 most popular items.
  httpGet.get({
    url: 'http://qe11-openapi.kohlsecommerce.com/v1/recommendation?type=toptrending&limit=99',
    bufferType: "buffer",
    postalCode: '' + 94102,
    headers: {
      'X-APP-API_KEY': config['X-APP-API_KEY'],
      'Accept': 'application/json'
    },
    }, function(error, result) {
      if (error) {
        console.error(error);
      } else {
        webStoreItems = JSON.parse(result.buffer).payload.recommendations[0].products;
        grabUPCs();
      }
    }
  );
};

var DLcomplete = true;
var eventLoop = function(){
  startOfRound = (new Date())/1;
  state.currentWinner = null;
  leaderboard.newRound();
  determineNextItem();
  setTimeout(eventLoop, roundLength + restLength);
};


loadItems();
eventLoop();



