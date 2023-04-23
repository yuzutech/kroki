package io.kroki.server.decode.transcoder.deflate;

import java.io.ByteArrayOutputStream;
import java.io.Closeable;
import java.io.IOException;

public class OutputStreamProtected implements Closeable {
  // ::remove folder when __HAXE__

  public static final int MAX_OUTPUT_SIZE = 1024 * 1024;

  private final ByteArrayOutputStream baos = new ByteArrayOutputStream();
  private int counter = 0;

  public void close() throws IOException {
    baos.close();
  }

  public byte[] toByteArray() {
    return baos.toByteArray();
  }

  public void write(int b) throws IOException {
    this.counter++;
    baos.write(b);
    if (counter > MAX_OUTPUT_SIZE) {
      throw new IOException("Too big");
    }

  }

}
