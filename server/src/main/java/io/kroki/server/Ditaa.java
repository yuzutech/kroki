package io.kroki.server;

import org.stathissideris.ascii2image.core.CommandLineConverter;

import java.io.InputStream;
import java.io.OutputStream;

public class Ditaa {

  public static void convert(InputStream inputStream, OutputStream outputStream) {
    String[] args = new String[]{};
    CommandLineConverter.convert(args, inputStream, outputStream);
  }
}
