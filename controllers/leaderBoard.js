var scores = [];
var players = 0;
var finished = 0;

exports.getWinners = function(n) {
  return scores.slice(0,n);
};

exports.addWinner = function(info){
  //push a new winner to the end of the array
  console.log(info);
  scores.unshift(info);
};

exports.addPlayer = function() {
  players++;
};

exports.results = function(info) {
  console.log("results called.");
  if (finished === 0) {
    exports.addWinner(info);
  }
  return [++finished, players];
};

exports.newRound = function() {
  console.log("newRound called");
  players = 0;
  finished = 0;
};