
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
// var user = require('./routes/user');
var http = require('http');
var path = require('path');
var dataReq = require('./routes/dataReq');
var querystring = require('querystring');
var analytics = require('./controllers/analytics')


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/getCurrentItem', dataReq.getCurrentItem);
app.get('/getRoundData', dataReq.getRoundData);
app.get('/getWinners', dataReq.getWinners);
app.get('/showData', analytics.showData);
app.get('/won', analytics.won);



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});



