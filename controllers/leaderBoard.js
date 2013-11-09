var scores = [];

exports.getWinners = function(n){
  //n is number of winners to return
  n > scores.length ? n = scores.length : n;
  return scores.slice(0,n);
};

exports.addWinner = function(name, time, itemName){
  //push a new winner to the end of the array
  scores.push({
    name: name,
    time: time,
    itemName: itemName
  })
};