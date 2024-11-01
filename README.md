# sprite-to-animation

Console app that converts 1 row/1:1 ratio sprites, to an animated image, GIF or
WebP, with Sharp and ImageMagick.

| Before | ![horizontal sprite of a green dinosaur walking](test.png) |
| ------ | ---------------------------------------------------------- |
| After  | ![animated green dinosaur walking](test.webp)              |

## Requisites

The app is built with Deno, so you need to have it installed to run the app.

[Installing Deno](https://docs.deno.com/runtime/getting_started/installation/)

## Usage

The app accepts both local paths or http uris that point to a file.

`deno run -A main.ts [flags] <path or uri>`

## Flags

### --frameDelay

Default: 3 (30ms).

*Sets the delay between each frame of the generated animation. The delay is set in 1/100th of a second (1 = 10ms).*
