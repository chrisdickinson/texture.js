module.exports = GLTextureStream

var EE = require('events').EventEmitter

function GLTextureStream(tex, dx, dy, dw, dh) {
  this.texture = tex
  this.dx = dx
  this.dy = dy
  this.dw = dw
  this.dh = dh

  EE.call(this)
}

var cons = GLTextureStream
  , proto = cons.prototype = new EE

proto.constructor = cons

proto.write = function(img) {
  this.texture.writeImage(img, 0, 0, img.width, img.height, this.dx, this.dy, this.dw, this.dh)
}

proto.writable = true
