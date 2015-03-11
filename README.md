# vfk-parser

Streamlined parser of files in VFK = czech GIS interchange fmt.
Following text in czech:

Podrobnosti o [VFK formatu](http://www.cuzk.cz/Katastr-nemovitosti/Poskytovani-udaju-z-KN/Vymenny-format-KN/Vymenny-format-ISKN-v-textovem-tvaru/Popis_VF_ISKN-v5_1-1-(1).aspx).


## usage

```
var fs = require('fs');
var VFKParser = require('vfk-parser');
var parser = new VFKParser();

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
```
