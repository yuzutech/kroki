using System;
using System.IO;
using System.IO.Compression;
using System.Text;

class Program
{
    static byte[] Deflate(byte[] data, CompressionLevel? level = null)
    {
        using (var memStream = new MemoryStream())
        {
#if NET6_0_OR_GREATER
            using(ZLibStream zlibStream = level.HasValue ? new(memStream, level.Value, true) : new(memStream, CompressionMode.Compress, true))
            {
                zlibStream.Write(data);
            }
#else

            // Reference: https://yal.cc/cs-deflatestream-zlib/#code

            // write header:
            memStream.WriteByte(0x78);
            memStream.WriteByte(level switch
            {
                CompressionLevel.NoCompression or CompressionLevel.Fastest => 0x01,
                CompressionLevel.Optimal => 0x0A,
                _ => 0x9C,
            });

            // write compressed data (with Deflate headers):
            using (DeflateStream dflStream = level.HasValue ? new(memStream, level.Value, true) : new(memStream, CompressionMode.Compress, true))
            {
                dflStream.Write(data, 0, data.Length);
            }

            // compute Adler-32:
            uint a1 = 1, a2 = 0;
            foreach (byte b in data)
            {
                a1 = (a1 + b) % 65521;
                a2 = (a2 + a1) % 65521;
            }

            memStream.WriteByte((byte)(a2 >> 8));
            memStream.WriteByte((byte)a2);
            memStream.WriteByte((byte)(a1 >> 8));
            memStream.WriteByte((byte)a1);

#endif

            return memStream.ToArray();
        }

        
    }

    public static void Main(string[] args)
    {
        var compressedBytes = Deflate(Encoding.UTF8.GetBytes("digraph G {Hello->World}"));
#if NET9_0_OR_GREATER
        // You can use this in previous version of .NET  with Microsoft.Bcl.Memory package
        var encodedOutput = System.Buffers.Text.Base64Url.EncodeToString(compressedBytes);
#else
        var encodedOutput = Convert.ToBase64String(compressedBytes).Replace('+', '-').Replace('/', '_');
#endif
        Console.WriteLine($"https://kroki.io/graphviz/svg/{encodedOutput}");
    }
}
