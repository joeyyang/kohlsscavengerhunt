
var httpGet = require('http-get');
var config = require('../config')

exports.doGet = function(req,res){


  var options = {url: 'http://qe11-openapi.kohlsecommerce.com/v1/product?skuCode=91100247', 
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
      var imgLink = JSON.parse(result.buffer).payload.products[0].images[0].url;
      res.writeHead(200,{'content-type':'text/html'});
      res.end("<img src='"+imgLink+"'></img>")
    }
  });

};

