module.exports = GLTexture

var GLOptions = require('./options')

function GLTexture(dimensions, handle) {
  this.dimensions = dimensions
  this._handle = handle
}

var cons = GLTexture
  , proto = cons.prototype

cons._defaults = new GLOptions({
  'wrap_width':   'clamp'
, 'wrap_height':  'clamp'
, 'mag':          'linear'
, 'min':          'linear'
}) 

cons._gl = null

cons.gl = function(gl) {
  return this._gl = gl || this._gl
}

cons.defaults = function(opts) {
  return this._defaults = opts ? this._defaults.extend(opts) : this._defaults
}

cons.fromCanvas = 
cons.fromImage = function(image, options, ready) {
  if(ready === undefined) {
    ready = options
    options = this.defaults()
  } else {
    options = this.defaults().extend(options)
  }

  var err = options.validate(image)
    , gl = this.gl()
    , handle

  if(err) {
    return ready(err)
  }

  handle = gl.createTexture()

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.bindTexture(gl.TEXTURE_2D, handle)

  if(image.fb) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  } else {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image) 
  }

  options.toGL(gl, handle, image) 

  gl.bindTexture(gl.TEXTURE_2D, null)

  return ready(null, new this([image.width, image.height], handle))
}

cons.fromURL = function(url, opts, ready) {
  var img = new Image
  img.src = url
  image.onload = function() {
    create_texture(image, opts, ready)
  }

  image.onerror = function() {
    ready(new Error('Could not load texture from '+image.src))
  }
}

cons.create = function(dimensions, color, opts, ready) {
  var canvas = document.createElement('canvas')
    , ctx

  if(color === null) {
    return this.fromImage({width: dimensions[0], height: dimensions[1], fb:true}, opts, ready)
  }

  canvas.width = dimensions[0]
  canvas.height = dimensions[1]

  ctx = canvas.getContext('2d')

  ctx.fillStyle = color

  ctx.fillRect(0, 0, canvas.width, canvas.height)

  return this.fromCanvas(canvas, opts, ready) 
}

proto.handle = function() { 
  return this._handle
}

proto.createWriteStream = function(dx, dy, dw, dh) {
  return new GLTextureStream(
      this
    , 0
    , 0
    , 0
    , 0
    , dx || 0, dy || 0
    , dw || this.dimensions[0]
    , dh || this.dimensions[1]
  )
}

proto.writeImage = function(image, sx, sy, sw, sh, dx, dy, dw, dh) {
  var gl = this.constructor.gl()
    , cvs = document.createElement('canvas')
    , ctxt
    , data
  
  gl.bindTexture(gl.TEXTURE_2D, this.handle())

  var width = this.dimensions[0]
    , height = this.dimensions[1]
    , dxw = dx + dw
    , dyh = dy + dh

  if(dw === sw && dh === sh && sx === 0 && sy === 0 && dxw <= width && dyh <= height) {
    // do a quick copy
    console.log('quick')
    gl.texSubImage2D(gl.TEXTURE_2D, 0, dx, dy, gl.RGBA, gl.UNSIGNED_BYTE, image) 
    gl.bindTexture(gl.TEXTURE_2D, null)
    return
  }

  var sxw = sx + sw
    , syh = sy + sh

  cvs.width = Math.abs(dw)
  cvs.height = Math.abs(dh)

  ctxt = cvs.getContext('2d')

  ctxt.drawImage(image, sx, sy, sw, sh, 0, 0, cvs.width, cvs.height)

  var dims = [Math.max(0, dx), Math.max(0, dy), Math.min(width, cvs.width), Math.min(height, cvs.height)]

  if(dims[2] + dims[0] > width) {
    dims[2] = width - dims[0]
  }

  if(dims[3] + dims[1] > height) {
    dims[3] = height - dims[1]
  }

  data = ctxt.getImageData.apply(ctxt, [0, 0, dims[2], dims[3]])

  var out = new Uint8Array(data.data.length)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)

  gl.texSubImage2D(
      gl.TEXTURE_2D
    , 0
    , dims[0]
    , dims[1]
    , dims[2]
    , dims[3]
    , gl.RGBA
    , gl.UNSIGNED_BYTE
    , data.data
  )
  gl.bindTexture(gl.TEXTURE_2D, null)
}

proto.asFramebuffer = function() {
  var gl = this.constructor.gl()
    , buf = gl.createRenderbuffer()
    , hnd = this.handle()

  gl.bindTexture(gl.TEXTURE_2D, hnd)
  gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer)
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.dimensions[0], this.dimensions[1])
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, hnd, 0)
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, buf)

  gl.bindTexture(gl.TEXTURE_2D, null)
  gl.bindRenderbuffer(gl.RENDERBUFFER, null)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
}
