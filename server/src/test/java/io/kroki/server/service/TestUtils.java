package io.kroki.server.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class TestUtils {
  public static final Path SNAPSHOT_DIR = Path.of("src/test/resources");

  public static String readTestResource(String sourceFilename) throws IOException {
    return Files.readString(getTestResourcePath(sourceFilename));
  }

  public static Path getTestResourcePath(String sourceFilename) {
    return SNAPSHOT_DIR.resolve(sourceFilename);
  }
}
