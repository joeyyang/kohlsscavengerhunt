var data = [];

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