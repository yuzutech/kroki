package io.kroki.server;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Test support class used by unit and integration tests.
 */
public class TestHarness {

  private static final Path RESOURCES_DIR = Path.of("src/test/resources");

  /**
   * Reads the content of a test resource file as a string.
   *
   * @param sourceFilename path of the file relative to {@code src/test/resources}
   * @return the file content
   * @throws IOException if the file cannot be read
   */
  public static String readTestResource(String sourceFilename) throws IOException {
    return Files.readString(getTestResourcePath(sourceFilename));
  }

  /**
   * Resolves the absolute {@link Path} of a test resource file.
   *
   * @param sourceFilename path of the file relative to {@code src/test/resources}
   * @return the resolved path
   */
  public static Path getTestResourcePath(String sourceFilename) {
    return RESOURCES_DIR.resolve(sourceFilename);
  }

  /**
   * Removes XML comments and PlantUML processing instructions from the given XML string.
   *
   * <p>Strips:
   * <ul>
   *   <li>XML comments: {@code <!-- ... -->}</li>
   *   <li>PlantUML processing instructions: {@code <?plantuml ... ?>} and {@code <?plantuml-src ... ?>}</li>
   * </ul>
   *
   * <p>Useful for comparing generated SVG/XML output without noise injected by the PlantUML renderer.
   *
   * @param xmlContent the XML string to process
   * @return the XML string with XML comments and PlantUML processing instructions removed
   * @see #stripXMLComments(String)
   */
  public static String stripPlantUMLComments(String xmlContent) {
    return stripXMLComments(xmlContent).replaceAll("<\\?plantuml(-src)? [^?]+\\?>", "");
  }

  /**
   * Removes all XML comments ({@code <!-- ... -->}) from the given XML string.
   *
   * @param xmlContent the XML string to process
   * @return the XML string with all XML comments removed
   */
  public static String stripXMLComments(String xmlContent) {
    return xmlContent.replaceAll("<!--[\\s\\S]*?-->", "");
  }
}
