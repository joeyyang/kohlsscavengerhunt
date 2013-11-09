
var httpGet = require('http-get');
var config = require('../config');
var currentItemMale;
var currentItemFemale;



exports.getCurrentItem = function(req,res){
  if(req.query.gender === "male"){
    res.writeHead(200);
    res.end(JSON.stringify(currentItemMale));
  } else if (req.query.gender === "female"){
    res.writeHead(200);
    res.end(currentItemFemale);
  }
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
                 headers: {
                  'X-APP-API_KEY': config['X-APP-API_KEY'],
                  'Accept': 'application/json'
                  }
                };

  httpGet.get(options, function (error, result) {
    if (error) {
      console.error(error);
    } else {
      console.log('The response HTTP headers: ' + result.headers);
      console.log(JSON.parse(result.buffer).payload.products[0]);
      currentItemMale = {
        link: JSON.parse(result.buffer).payload.products[0].images[0].url,
        title: JSON.parse(result.buffer).payload.products[0].productTitle
      }
    }
  });

  var randomUPC = upcFemale[~~(Math.random()*upcFemale.length)];

  var options = {url: 'http://qe11-openapi.kohlsecommerce.com/v1/product?upc='+ randomUPC,
                 headers: {
                  'X-APP-API_KEY': config['X-APP-API_KEY'],
                  'Accept': 'application/json'
                  }
                };
  httpGet.get(options, function (error, result) {
    if (error) {
      console.error(error);
    } else {
      console.log('The response HTTP headers: ' + result.headers);
      currentItemMale = {
        link: JSON.parse(result.buffer).payload.products[0].images[0].url,
        title: JSON.parse(result.buffer).payload.products[0].productTitle
      }
    }
  });
};


var eventLoop = function(){
  currentItem = determineNextItem(); 
  // setTimeout(eventLoop,4000);
};

eventLoop();


