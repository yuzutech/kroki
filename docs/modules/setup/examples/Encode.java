package main;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.zip.Deflater;

public class Encode {

  public static byte[] encode(String decoded) throws IOException {
    return Base64.getUrlEncoder().encode(compress(decoded.getBytes()));
  }

  private static byte[] compress(byte[] source) throws IOException {
    byte[] result = new byte[2048];
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
}
