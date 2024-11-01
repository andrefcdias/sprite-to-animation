import sharp, { Region } from "sharp";
import {
  GifDisposeMethod,
  initialize,
  MagickFormat,
  MagickImage,
  MagickImageCollection,
} from "https://deno.land/x/imagemagick_deno@0.0.31/mod.ts";

const imagePath = Deno.args[0]
if (!imagePath) {
  throw new Error("No image path provided");
}
const fileContents = await Deno.readFile(Deno.args[0]);

const sharpImage = sharp(fileContents);
const metadata = await sharpImage.metadata();
if (!metadata.height || !metadata.width) {
  throw new Error("Couldn't determine image height or width");
}

const isVertical = metadata.height > metadata.width;
const size = isVertical ? metadata.width : metadata.height;
const frameCount = Math.floor(
  isVertical ? metadata.height / size : metadata.width / size
);

await initialize();
const frameCollection = MagickImageCollection.create();

for (let i = 0; i < frameCount; i++) {
  const region: Region = {
    height: size,
    width: size,
    top: isVertical ? size * i : 0,
    left: isVertical ? 0 : size * i,
  };

  const cropped = await sharpImage.clone().extract(region).toBuffer();
  const magickImage = MagickImage.create(new Uint8Array(cropped));
  magickImage.animationDelay = 5;
  magickImage.gifDisposeMethod = GifDisposeMethod.Previous;
  frameCollection.push(magickImage);
}

frameCollection.write(MagickFormat.WebP, (img) =>
  Deno.writeFileSync("test.webp", img)
);
