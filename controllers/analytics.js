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

var pushData = function(){

}

exports.showData = function(req,res){
  myRoot.push({user:'john',message:"hello world!"});

  res.writeHead(200);
  res.end();
}

exports.won = function(item){
  var ref = myRoot.child("wins").child(item.upc);
  ref.transaction(function(current) {
    return current + 1;
  });
}

exports.lost = function(item){
  var ref = myRoot.child("plays").child(item.upc);
  ref.transaction(function(current) {
    return current + 1;
  });
}

      // upc: randomUPC,
      //   link: product.images[0].url,
      //   title: product.productTitle,
      //   coupon: hashString(product.productTitle).slice(0,8)