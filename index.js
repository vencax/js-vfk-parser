
var util = require('util');
var Writable = require('stream').Writable;
util.inherits(VFKParser, Writable);


function VFKParser(options) {
  Writable.call(this, options);
  this._inHead = true;
  this._line = [];
  this._lineNum = 0;
  this._type = 0;
  this._head = [];
  this._curr_block_info = null;
}
module.exports = VFKParser;


VFKParser.prototype._create_block_info = function() {
  var parts = Buffer(this._line).toString().split(';');
  var rv = {
    name: parts.shift(),
    headers: []
  };
  for(var i=0; i<parts.length; i++) {
    rv.headers.push(parts[i].split(' '));
  }
  return rv;
}


VFKParser.prototype._create_item = function() {
  var parts = Buffer(this._line).toString().split(';');
  if(this._curr_block_info.name !== parts.shift()) {
    console.log('WARN: partname not match headers, line: ' + this._lineNum);
  }

  var h, val;
  var item = [];
  for(var i=0; i<this._curr_block_info.headers.length; i++) {
    val = parts[i].split('"').join('');
    if(val.length === 0) {
      item.push(null);
      continue;
    }
    h = this._curr_block_info.headers[i];
    switch(h[1][0]) {  // switch according first letter of columt type
    case 'T':
      item.push(val);
      break;
    case 'D':
      item.push(new Date(val));
      break;
    case 'N':
      if(h[1].indexOf('.') > 0) {    // float
        item.push(parseFloat(val));
      } else {                // int
        item.push(parseInt(val, 10));
      }
      break;
    }
  }
  return item;
}


VFKParser.prototype._on_lineread = function() {
  switch(this._type) {
  case 'H':
    this._head.push(Buffer(this._line));
    break;
  case 'D':
    if(this._inHead) {
      this._head.push(Buffer(this._line));
    } else {
      this.emit('item', this._create_item());
    }
    break;
  case 'B':
    if(this._inHead) {
      this.emit('head', this._head);
      this._inHead = false;
    }
    this._curr_block_info = this._create_block_info();
    this.emit('header', this._curr_block_info);
    break;
  case 'K':
    // we are @ da end, yay!
    break;
  }
}

VFKParser.prototype._write = function (chunk, enc, done) {
  var i = 0;

  while(i < chunk.length) {
    if(chunk[i] === 13) {  // lines ends with CRLF
      i++;
      if(chunk[i] === 10) {
        if(chunk[i-2] === '¤'.charCodeAt(0)) { // data containing newline
          this._line.push('\n'.charCodeAt(0));
        } else {
          this._on_lineread();
          this._lineNum++;
          this._line = [];
        }
      }
    } else if(chunk[i] === '&'.charCodeAt(0)) {
      i+=1; // skip the &
      this._type = String.fromCharCode(chunk[i]);
    } else if(chunk[i] === '¤'.charCodeAt(0)) {
      // skip
    } else {
      this._line.push(chunk[i]);
    }
    i++;
  }
  done();
};
