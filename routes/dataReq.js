var httpGet = require('http-get');
var config = require('../config');
var leaderboard = require('../controllers/leaderBoard');
var analytics = require('../controllers/analytics');

/////Game Config
var roundLength = 12000;
var restLength = 6000;
var startOfRound = null;

// Storage
var UPCList = [];
var state = {};
var nextItemState = {};

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
  var randomUPC = UPCList[~~(Math.random()*UPCList.length)];
  console.log('Picking a random UPC for next round.  UPC:', randomUPC);
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
      console.log('Name of random item picked:', product.productTitle);
      nextItemState.currentItem = { //state.currentItem = {
        upc: randomUPC,
        link: product.images[0].url,
        title: product.productTitle,
        coupon: hashString(product.productTitle).slice(0,8)
      };
    }
  });
};

var loadItems = function(){
  console.log('Gathering big list of items from recommendation API');
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
        console.log('Have pulled items from recommendation API.  Num items:', webStoreItems.length);
        grabUPCs();
      }
    }
  );
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
          console.log('UPC loaded');
          if (UPCList.length === 20){
            console.log('starting next round');
            eventLoop();
          }
        }
      }
    );
  }
};

var eventLoop = function(){
  console.log('--------------------')
  console.log('Starting a new round')
  startOfRound = (new Date())/1;
  state.currentWinner = null;
  leaderboard.newRound();
  state = nextItemState;
  determineNextItem();
  setTimeout(eventLoop, roundLength + restLength);
};

loadItems();