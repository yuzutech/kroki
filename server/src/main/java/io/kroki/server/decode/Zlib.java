package io.kroki.server.decode;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.zip.Deflater;
import java.util.zip.InflaterInputStream;

public class Zlib {

  public static byte[] compress(byte[] source) {
    Deflater deflater = new Deflater(Deflater.BEST_COMPRESSION);
    deflater.setInput(source);
    deflater.finish();

    byte[] buffer = new byte[2048];
    int compressedLength = deflater.deflate(buffer);
    byte[] result = new byte[compressedLength];
    System.arraycopy(buffer, 0, result, 0, compressedLength);
    return result;
  }

  public static String decompress(byte[] source) throws IOException {
    try (InflaterInputStream input = new InflaterInputStream(new ByteArrayInputStream(source));
         ByteArrayOutputStream buffer = new ByteArrayOutputStream()) {
      byte[] data = new byte[2048];
      int index;
      while ((index = input.read(data, 0, data.length)) != -1) {
        buffer.write(data, 0, index);
      }
      return buffer.toString();
    }
  }
}
