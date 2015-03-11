
var util = require('util');
var Writable = require('stream').Writable;
util.inherits(VFKParser, Writable);


function VFKParser(options) {
  Writable.call(this, options);
  this._inBody = false;
  this._line = [];
  this._lineNum = 0;
  this._type = 0;
  this._head = [];
}
module.exports = VFKParser;


VFKParser.prototype._on_lineread = function() {
  switch(this._type) {
  case 'H':
    this._head.push(Buffer(this._line));
    break;
  case 'D':
    if(! this._inBody) {
      this.emit('head', this._head);
      this._inBody = true;
    }
    this.emit('item', Buffer(this._line).toString());
    break;
  case 'B':
    this.emit('header', Buffer(this._line).toString());
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
