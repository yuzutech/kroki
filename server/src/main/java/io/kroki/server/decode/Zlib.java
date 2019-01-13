package io.kroki.server.decode;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.zip.DataFormatException;
import java.util.zip.Deflater;
import java.util.zip.Inflater;

public class Zlib {

  public static byte[] compress(byte[] source) throws IOException {
    byte[] result = new byte[512];
    Deflater deflater = new Deflater(Deflater.BEST_COMPRESSION);
    deflater.setInput(source, 0, source.length);
    deflater.finish();
    int compressedLength = deflater.deflate(result, 0, source.length, Deflater.FULL_FLUSH);
    deflater.end();
    try (ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream()) {
      byteArrayOutputStream.write(result, 0, compressedLength);
      return byteArrayOutputStream.toByteArray();
    }
  }

  public static String decompress(byte[] source) throws DataFormatException, UnsupportedEncodingException {
    Inflater decompresser = new Inflater();
    decompresser.setInput(source, 0, source.length);
    byte[] result = new byte[512];
    int resultLength = decompresser.inflate(result);
    decompresser.end();
    return new String(result, 0, resultLength, "UTF-8");
  }
}
