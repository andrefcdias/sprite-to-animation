# sprite-to-animation

Console app that converts 1 row/1:1 ratio sprites, to an animated image, GIF or WebP, with ImageMagick.

| Before | ![horizontal sprite of a green dinosaur walking](test.png)  |
| ------ | -------------- |
| After  | ![animated green dinosaur walking](test.webp) |

## Usage

The app accepts both local paths or http uris that point to a file.

`dotnet run <path or uri> <...>`

`dotnet run /cool-sprite.png https://coolurl.com/cool-sprite.png`
