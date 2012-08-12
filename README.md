# texture.js

Browserify-compatible, streamable webgl 2D texture module.

````javascript

var texture = require('texture.js')
  , canvas = document.createElement('canvas')
  , gl = canvas.getContext('experimental-webgl')
  , Texture = texture(gl)

Texture.fromURL('image.png', function(err, texture) {
  var img = new Image
  img.src = 'someotherimg.jpg'
  img.onload = function() {
    texture.writeImage(
        img
      , 0
      , 0
      , img.width
      , img.height
      , Math.floor(texture.width()/2)
      , Math.floor(texture.height()/2)
      , img.width
      , img.height
    )
  }
})

````

## API

### require('texture.js') -> function texture(gl){}

Returns a function that accepts a WebGL context and returns
the `Texture` constructor function.

### texture(gl) -> Texture

Returns the `Texture` constructor when provided a gl context.

### Texture.fromCanvas
### Texture.fromImage(image[, options], ready)

Static method that accepts a `HTMLCanvas` or `Image` element,
as well as optional [options](#Options) object and a node-style
`ready` callback (`function(err, texture instance) {}`).

Dimensions are pulled from the incoming element.

> ### NB:
> This method is designed to accept `Image` objects
> that have already loaded -- that is, their `onload`
> has already been called.
>
> For images that haven't loaded yet, use `Texture.fromURL`.

### Texture.fromURL(url[, options], ready)

Static method that accepts a string URL to load as a texture.
Otherwise follows the `fromImage` API.

> ### NB:
> Textures should be loaded from the same domain,
> or from a domain that provides the appropriate CORS
> headers.

### Texture.create(dimensions, color[, options], ready)

Static method that accepts a set of integer dimensions `[width, height]`, a color -- either `null` for empty textures or `[red, green, blue, alpha]` floating point values, an optional [options](#Options) object, and a node-style callback.

### Texture#handle() -> WebGL texture handle

Returns a handle suitable for passing to `gl.bindTexture`.

````javascript
// e.g.,
gl.bindTexture(gl.TEXTURE_2D, myTexture.handle())
````

### Texture.writeImage(img, sx, sy, sw, sh, dx, dy, dw, dh)

Writes a subset of `img` (using `sx, sy, sw, sh`) to the texture
using `gl.texSubImage2D` at the destination using `dx, dx, dw, dh`.

`img` may be a loaded `Image` object, an `HTMLCanvasElement`, or an `HTMLVideoElement`.

> ### NB:
> When using HTMLCanvasElements or HTMLVideoElements,
> or when the image would be clipped against the texture dimensions
> or otherwise resized, the image will be drawn to a temporary
> canvas element and copied using `canvas.getImageData`. 

### Texture.asFramebuffer() -> WebGL Render buffer handle

Creates and returns a render buffer handle whose storage is specified as the current texture (for render-to-texture).

### Texture.enable(textureUnit = 0) -> textureUnit

Enables the texture on the specified `textureUnit`. Equivalent to

````javascript
    gl.activeTexture(gl['TEXTURE'+textureUnit])
    gl.bindTexture(gl.TEXTURE_2D, myTexture.handle())
    return textureUnit
````

### Texture.width() -> integer width
### Texture.height() -> integer height

Returns the requested dimension of the image.

### Texture.createWriteStream([dx, dy, dw, dh]) -> TextureStream

Return a writable stream to this texture. `data` events will be
delegated to `texture.writeImage(DATA_EVENT_PAYLOAD, 0, 0, incoming_width, incoming_height, dx, dy, dw, dh)`.

## Options

### mag

`gl.texParameteri(TEXTURE_2D, TEXTURE_MAG_FILTER, <value>)`

**Values**
* `"linear"`: `gl.LINEAR`
* `"nearest"`: `gl.NEAREST`

### min

`gl.texParameteri(TEXTURE_2D, TEXTURE_MIN_FILTER, <value>)`

**Values**
* `"linear"`: `gl.LINEAR`
* `"nearest"`: `gl.NEAREST`
* `"mipmap"`: `gl.LINEAR_MIPMAP_LINEAR`

> ### NB:
> `mipmap` can only be used with power of two textures
> whose edges are set to `clamp`.
>
> Using mipmap will automatically do the required
> setup (calling gl.generateMipmap(), etc). 

### wrap_width
### wrap_height

`gl.texParameteri(TEXTURE_2D, TEXTURE_WRAP_S|T, <value>)`

**Values**
* `"repeat"`: `gl.REPEAT`
* `"clamp"`: `gl.CLAMP_TO_EDGE`



