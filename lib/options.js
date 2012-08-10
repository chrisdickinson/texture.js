module.exports = Options

function Options(opts) {
  this.opts = opts
}

var cons = Options
  , proto = cons.prototype

proto.map_values = {
    'repeat':   'REPEAT'
  , 'clamp':    'CLAMP_TO_EDGE'
  , 'linear':   'LINEAR'
  , 'nearest':  'NEAREST'
  , 'mipmap':   'LINEAR_MIPMAP_LINEAR'
}

proto.map_keys = {
    'mag':          ['TEXTURE_2D', 'TEXTURE_MAG_FILTER']
  , 'min':          ['TEXTURE_2D', 'TEXTURE_MIN_FILTER']
  , 'wrap_width':   ['TEXTURE_2D', 'TEXTURE_WRAP_S']
  , 'wrap_height':  ['TEXTURE_2D', 'TEXTURE_WRAP_T']
}

proto.toGL = function(gl) {
  var out = []
  for(var key in this.opts) {
    var value = this.map_values[this.opts[key]]
      , key = this.map_keys[key]

    key.push(value)

    for(var i = 0, len = key.length; i < len; ++i) {
      key[i] = typeof key[i] === 'string' ? gl[key[i]] : key[i]
    }

    gl.texParameteri.apply(gl, key)
  }

  if(this.opts.min === 'mipmap') {
    gl.generateMipmap(gl.TEXTURE_2D)
  }
}

proto.validate = function(img) {
  if(this.opts.min === 'mipmap') {
    if(this.opts.wrap_width !== 'clamp' || this.opts.wrap_height !== 'clamp') {
      return new Error('Cannot use mipmaps unless both wrap_height and wrap_width are set to clamp')
    }
  
    var npot = image.width !== image.height || (image.width & (image.width - 1)) !== 0

    if(npot) {
      return new Error('Cannot use a non-power of two texture with mipmaps.')
    }
  }
}

proto.extend = function(opts) {
  var out = {}
  for(var key in this.opts) {
    out[key] = this.opts[key]
  }

  for(var key in opts) {
    out[key] = opts[key]
  }

  return new Options(out)
}
