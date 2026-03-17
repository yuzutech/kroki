package io.kroki.server.service;

import org.assertj.core.api.AbstractCharSequenceAssert;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static io.kroki.server.service.TestUtils.getTestResourcePath;
import static io.kroki.server.service.TestUtils.readTestResource;

public class SnapshotAssert extends AbstractCharSequenceAssert<SnapshotAssert, String> {

  private static final Boolean FORCE_UPDATE_SNAPSHOT = Boolean.parseBoolean(System.getenv("FORCE_UPDATE_SNAPSHOT"));

  protected SnapshotAssert(String actual) {
    super(actual, SnapshotAssert.class);
  }

  public static SnapshotAssert assertThat(String result) {
    return new SnapshotAssert(result);
  }

  /**
   * Expect actual to be the same as in the file provided (commited to git)<br>
   * If change is intended, you can update the file :<br>
   * - manually<br>
   * - by deleting the file and running the test<br>
   * - by running the test with environment variable FORCE_UPDATE_SNAPSHOT=true
   *
   * @param expectedFilename
   */
  public void matchesSnapshot(String expectedFilename) {
    isNotNull();
    Path expectedPath = getTestResourcePath(expectedFilename);
    try {
      if (FORCE_UPDATE_SNAPSHOT) {
        Files.writeString(expectedPath, actual);
        failWithMessage("Snapshot updated: %s", expectedFilename);
      } else if (!Files.exists(expectedPath)) {
        Files.writeString(expectedPath, actual);
        failWithMessage("Snapshot not found, create it: %s", expectedFilename);
      } else {
        isEqualToIgnoringNewLines(readTestResource(expectedFilename));
      }
    } catch (IOException e) {
      failWithMessage("Failed to read snapshot file <%s>: %s", expectedFilename, e.getMessage());
    }
  }
}
