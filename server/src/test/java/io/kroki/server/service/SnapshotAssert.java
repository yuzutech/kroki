package io.kroki.server.service;

import org.assertj.core.api.AbstractCharSequenceAssert;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static io.kroki.server.TestHarness.getTestResourcePath;
import static io.kroki.server.TestHarness.readTestResource;

/**
 * AssertJ assertion for snapshot testing.
 *
 * <p>Compares a string result against a reference file committed to the repository.
 * If the snapshot file does not exist yet, it is created automatically on the first test run.
 *
 * <p>When an intentional change produces a different output, update the snapshot using one of:
 * <ul>
 *   <li>Edit the snapshot file manually</li>
 *   <li>Delete the snapshot file and re-run the test</li>
 *   <li>Re-run the test with the environment variable {@code FORCE_UPDATE_SNAPSHOT=true}</li>
 * </ul>
 */
public class SnapshotAssert extends AbstractCharSequenceAssert<SnapshotAssert, String> {

  /**
   * When {@code true}, every assertion overwrites the snapshot file with the actual value
   * and then fails so that the diff is visible in the test report.
   * Controlled by the {@code FORCE_UPDATE_SNAPSHOT} environment variable.
   */
  private static final Boolean FORCE_UPDATE_SNAPSHOT = Boolean.parseBoolean(System.getenv("FORCE_UPDATE_SNAPSHOT"));

  protected SnapshotAssert(String actual) {
    super(actual, SnapshotAssert.class);
  }

  /**
   * Entry point for snapshot assertions.
   *
   * @param result the string value under test
   * @return a new {@link SnapshotAssert} for the given value
   */
  public static SnapshotAssert assertThat(String result) {
    return new SnapshotAssert(result);
  }

  /**
   * Asserts that the actual value matches the content of the given snapshot file,
   * ignoring line-ending differences.
   *
   * <ul>
   *   <li>If {@code FORCE_UPDATE_SNAPSHOT=true}, the file is overwritten with the actual value
   *       and the assertion fails to signal that the snapshot was refreshed.</li>
   *   <li>If the file does not exist, it is created with the actual value and the assertion fails
   *       so the new snapshot is reviewed before being committed.</li>
   *   <li>Otherwise, the actual value must equal the file content (line endings ignored).</li>
   * </ul>
   *
   * @param expectedFilename path of the snapshot file relative to {@code src/test/resources}
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
