# sprite-to-animation

Console app that converts 1 row/1:1 ratio sprites, to an animated image, GIF or
WebP, with Sharp and ImageMagick.

| Before | ![horizontal sprite of a green dinosaur walking](test.png) |
| ------ | ---------------------------------------------------------- |
| After  | ![animated green dinosaur walking](test.webp)              |

## Usage

The app accepts both local paths or http uris that point to a file.

`deno run -A main.ts <path or uri> <...>`

## Examples

`deno run -A main.ts /cool-sprite.png`

`deno run -A main.ts https://coolurl.com/cool-sprite.png`
