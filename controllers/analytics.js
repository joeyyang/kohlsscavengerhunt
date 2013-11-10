var Firebase = require('firebase');
var myRoot = new Firebase('https://kohlsscavengerhunt.firebaseIO.com');

var data = [];
var anal;
myRoot.on('value', function(snapshot) {
  anal = snapshot.val();
});


exports.add = function(toAdd) {
  if (Array.isArray(toAdd)) {
    for (var i = 0; i < toAdd.length; i++) {
      data.push(toAdd[i]);
    }
  } else {
    data.push(toAdd);
  }
};

exports.display = function() {
  console.log(data);
};


exports.showData = function(req,res){
  res.writeHead(200);
  res.end(JSON.stringify(anal));
}


exports.won = function(item){
  var ref = myRoot.child("wins").child(item.upc);
  ref.transaction(function(current) {
    return current + 1;
  });
}

exports.played = function(item){
  var ref = myRoot.child("plays").child(item.upc);
  ref.transaction(function(current) {
    return current + 1;
  });
}

exports.recordUser = function(item){
  item = JSON.parse(item);
  var ref = myRoot.child('users').child(item.username);
  ref.transaction(function(current){
    return current +1;
  });
};



