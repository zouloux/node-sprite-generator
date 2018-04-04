# FORK

This fork removed dependencies with canvas and gm.
Only pure node packaging is kept with jimp. This is lighter and remove dependencies to non-node softwares.

Also, generating stylesheet is only with a method now, this allow us to generate several stylesheet for one PNG sprite.

I updated the following doc :



# node-sprite-generator

Generates image sprites and their spritesheets from sets of images. Supports retina sprites.

## Installation

```bash
npm install node-sprite-generator
```

## Usage

### Standalone

```javascript
var nsg = require('node-sprite-generator');

nsg({
    src: [
        'images/sprite/*.png'
    ],
    spritePath: 'images/sprite.png',
    stylesheet: (generatedLayout) =>
    {
        // ... generate stylesheet file here
    }
}, function (err) {
    console.log('Sprite generated!');
});
```


## Options

node-sprite-generator tries to be very modular, so you can use the options we provide or write your own functions/modules to further customize your sprites.

#### options.src
Type: `String`
Default value: `[]`  
Specifies the images that will be combined to the sprite. node-sprite-generator uses glob pattern matching, so paths with wildcards are valid as well.

#### options.spritePath
Type: `String`
Default value: `''`  
The path your image sprite will be written to. ATM we only support the PNG format for the image sprite.

#### options.stylesheet
Type: `Function`
Specifies a custom stylesheet (see more at [extending node-sprite-generator](https://github.com/selaux/node-sprite-generator#extending-node-sprite-generator)).

#### options.layout
Type: `String|Function`
Default value: `'vertical'`  
Specifies the layout that is used to generate the sprite by using one of the built-in layouts or using a function that generates a custom layout (see more at [extending node-sprite-generator](https://github.com/selaux/node-sprite-generator#extending-node-sprite-generator)).

Built-in layouts:
- `'packed'`: Bin-packing Layout
- `'vertical'`: Vertically aligned layout
- `'horizontal'`: Horizontally aligned layout
- `'diagonal'`: Diagonally aligned layout

#### options.layoutOptions
Type: `Object`
Default value: `{}`  
Options that will be passed on to the layout generation. The built-in layouters support the following options.  
__padding__ (Type: `Integer` Default: `0`): Specifies the padding between the images in the layout.  
__scaling__ (Type: `Number` Default: `1`): Specifies the factor that the images are scaled with in the layout. This allows generating multiple, scaled versions of the same sprites using a single image set.  

#### options.compositorOptions
Type: `Object`
Default value: `{}`  
Options that will be passed on to the compositor. The built-in compositor supports the following options:  
__compressionLevel__ (Type: `Integer` Default: `6`): Specifies the compression level for the generated png file (compression levels range from 0-9).  
__filter__ (Type: `String` Default: `all`): Specifies the filter used for the generated png file. Possible values: `all`, `none`, `sub`, `up`, `average`, `paeth`.

## A more advanced example

```javascript
var nsg = require('node-sprite-generator');

nsg({
    src: [
        'public/images/sprite/*.png'
    ],
    spritePath: 'public/images/all-icons.png',
    layout: 'diagonal',
    layoutOptions: {
        padding: 30
    },
    stylesheet: (generatedLayout) =>
    {
        // ... generate stylesheet file here
    }
});
```

This will generate a diagonally layouted retina-enabled sprite that can be accessed using classes like ```all-icons-home```. The sprite will then be loaded from your static asset server.

## Extending node-sprite-generator

The internal pipeline for node-sprite-generator is

 - ```compositor.readImages(files, callback)``` -> ```callback(error, images)```
 - ```layout(images, options, callback)``` -> ```callback(error, layout)```
 - ```compositor.render(layout, spritePath, options, callback)``` -> ```callback(error)```
 - ```stylesheet(layout, options)``` -> ```callback(error)```

The used data formats are:

#### images
```
var images = [
   {
       width: Integer,
       height: Integer,
       data: compositor-specific
   }
]
```

#### layout
```
var layout = {
    width: Integer,
    height: Integer,
    images: [
        {
            x: Integer,
            y: Integer,
            width: Integer,
            height: Integer,
            data: compositor-specific
        }
    ]
}
```

## License

(The MIT License)

Copyright (c) 2013 Stefan Lau <github@stefanlau.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
