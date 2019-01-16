package io.kroki.server.decode;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.zip.Deflater;
import java.util.zip.InflaterInputStream;

public class Zlib {

  public static byte[] compress(byte[] source) throws IOException {
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

  public static String decompress(byte[] source) throws IOException {
    try (InflaterInputStream input = new InflaterInputStream(new ByteArrayInputStream(source));
         ByteArrayOutputStream buffer = new ByteArrayOutputStream()) {
      byte[] data = new byte[2048];
      int index;
      while ((index = input.read(data, 0, data.length)) != -1) {
        buffer.write(data, 0, index);
      }
      return new String(buffer.toByteArray());
    }
  }
}
