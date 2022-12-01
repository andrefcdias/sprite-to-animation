using ImageMagick;

const string TMP_DIR = "/tmp";
const string OUT_DIR = "output";
string[] FILE_TYPES = { "gif", "webp" };

var getInvalidPathError = (string path) => $"Skipping {path} as it is not a valid path or url";

async Task<Dictionary<string, byte[]>> ParseArgs(string[] cliArgs)
{
    if (cliArgs.Length == 0)
    {
        throw new ArgumentException("Usage: img-edit.exe <image path/url> <image path/url> ...");
    }

    List<Uri> uris = cliArgs.Aggregate(new List<Uri>(), (acc, path) =>
    {
        string validatedPath = File.Exists(path) ? Path.GetFullPath(path) : path;
        bool isValidUri = Uri.TryCreate(validatedPath, UriKind.Absolute, out var uri);
        if (isValidUri && uri != null)
        {
            acc.Add(uri);
            return acc;
        }

        Console.Error.WriteLine(getInvalidPathError(path));
        return acc;
    }).ToList();

    var files = new Dictionary<string, byte[]>();
    int nameCounter = 1;
    await Task.WhenAll(uris.Select(async (uri) =>
    {
        string filename = Path.GetFileName(uri.AbsolutePath);

        if (!Path.HasExtension(filename))
        {
            Console.Error.WriteLine($"Skipping {uri} because it doesn't have an extension");
            return;
        }

        string safeName = $"{nameCounter++}_{Path.GetFileNameWithoutExtension(filename)}";

        if (uri.Scheme == "file")
        {
            files.Add(safeName, await File.ReadAllBytesAsync(uri.LocalPath));
            return;
        }

        if (uri.Scheme.StartsWith("http"))
        {
            using (var client = new HttpClient())
            {
                files.Add(safeName, await client.GetByteArrayAsync(uri));
                return;
            }
        }

        Console.Error.WriteLine(getInvalidPathError(uri.AbsoluteUri));
    }));

    return files;
}

void ConvertImage(string filename, byte[] imageContent)
{
    MagickNET.SetTempDirectory(TMP_DIR);

    var frameCollection = new MagickImageCollection();
    var image = new MagickImage(imageContent);
    var isVertical = image.Height > image.Width;
    var size = isVertical ? image.Width : image.Height;

    var frameCount = isVertical ? image.Height / size : image.Width / size;
    var frames = image.CropToTiles(size, size).ToArray();
    for (int i = 0; i < frameCount; i++)
    {
        var frame = frames[i];
        frame.RePage();
        frame.AnimationDelay = 3;
        frame.GifDisposeMethod = GifDisposeMethod.Previous;
        frameCollection.Add(frame);
    }

    frameCollection.Coalesce();

    foreach (var fileType in FILE_TYPES)
    {
        string destPath = Path.Combine(OUT_DIR, $"{filename}.{fileType}");
        frameCollection.Write(destPath);
    }
}

var images = await ParseArgs(args);
Directory.CreateDirectory(OUT_DIR);
foreach (var image in images)
{
    ConvertImage(image.Key, image.Value);
}
