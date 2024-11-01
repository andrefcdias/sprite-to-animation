import sharp, { Region } from "sharp";
import {
  GifDisposeMethod,
  initialize,
  MagickFormat,
  MagickImage,
  MagickImageCollection,
} from "https://deno.land/x/imagemagick_deno@0.0.31/mod.ts";
import { parseArgs } from "@std/cli";

const sendHelp = (error?: string) => {
  if (error) {
    console.log(`%c${error}`, "color: red");
  }

  console.log(`
Usage: deno run -A main.ts [options] <image>
      
Flags:
  --frameDelay <ms>  The delay between frames in 1/100th of a second. Default is 10 (100ms).
  --help             Show this help message.
`);

  Deno.exit(error ? 1 : 0);
};

const parseArguments = () => {
  const args = parseArgs(Deno.args, {
    boolean: ["help"],
    string: ["frameDelay"],
    default: { frameDelay: "3" },
  });

  if (args.help) {
    sendHelp();
  }

  if (args._.length !== 1) {
    sendHelp("Image path or URI was not passed as an argument.");
  }

  const frameDelay = parseInt(args.frameDelay);
  if (isNaN(frameDelay) || frameDelay < 0) {
    sendHelp("frameDelay must be a positive integer.");
  }

  return {
    imagePath: args._[0].toString(),
    frameDelay,
  };
};

const readFile = async (path: string) => {
  try {
    const url = new URL(path);
    const isArgUrl = url.protocol.startsWith("http");

    if (isArgUrl) {
      const res = await fetch(path);
      return await res.arrayBuffer();
    }
  } catch (e) {
    const error = e as Error;
    if (error.name !== "TypeError") {
      console.log(error);
    }
  }

  return await Deno.readFile(path);
};

const parseImage = async (image: ArrayBuffer, frameDelay: number) => {
  const sharpImage = sharp(image);
  const metadata = await sharpImage.metadata();
  if (!metadata.height || !metadata.width) {
    throw new Error("Couldn't determine image height or width");
  }

  const isVertical = metadata.height > metadata.width;
  const size = isVertical ? metadata.width : metadata.height;
  const frameCount = Math.floor(
    isVertical ? metadata.height / size : metadata.width / size
  );

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
    magickImage.animationDelay = frameDelay;
    magickImage.gifDisposeMethod = GifDisposeMethod.Previous;
    frameCollection.push(magickImage);
  }

  return frameCollection;
};

const main = async () => {
  await initialize();

  const { imagePath, frameDelay } = parseArguments();

  const imageContents = await readFile(imagePath);

  const frameCollection = await parseImage(imageContents, frameDelay);

  frameCollection.write(MagickFormat.WebP, (img) =>
    Deno.writeFileSync("test.webp", img)
  );
};

await main();
