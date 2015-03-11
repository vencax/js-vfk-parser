
var fs = require('fs');
var Parser = require('../index');
var parser = new Parser();

parser.on('head', function(head) {
  console.log(head);
});

parser.on('item', function(item) {
  console.log(item);
});


parser.on('header', function(header) {
  console.log(header);
});

var source = fs.createReadStream(process.argv[2]);

source.pipe(parser);
