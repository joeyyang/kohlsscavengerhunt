var Firebase = require('firebase');
var myRootRef = new Firebase('https://kohlsscavengerhunt.firebaseIO.com');


exports.addData = function(req,res){

  myRootRef.push({user:'john',message:"hello world!"});
  res.writeHead(200);
  res.end();
}