package io.kroki.server;

import io.kroki.server.service.Ditaa;
import io.kroki.server.service.DitaaCommand;
import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;

import java.io.DataInputStream;
import java.io.EOFException;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.zip.GZIPInputStream;

/**
 * Extracts the ditaa native image, and the AWT shared libraries it loads from its own directory,
 * from the linux/amd64 image published by the "Tool images" workflow (see tools/ditaa).
 */
public class DownloadDitaaNativeImage {

  private static final String REPOSITORY = "yuzutech/kroki-builder-ditaa";
  private static final String IMAGE_DIRECTORY = "opt/ditaa/";

  public static Future<DitaaCommand> download(Vertx vertx) {
    String ditaaVersion = new Ditaa(vertx, new JsonObject()).getVersion();
    return vertx.executeBlocking(() -> {
      String binPath = System.getenv("KROKI_DITAA_BIN_PATH");
      if (binPath == null || binPath.isBlank()) {
        binPath = extract(ditaaVersion);
      }
      JsonObject options = new JsonObject();
      options.put("KROKI_DITAA_BIN_PATH", binPath);
      return new DitaaCommand(options);
    });
  }

  private static String extract(String ditaaVersion) throws IOException, InterruptedException {
    String buildDirectory = System.getProperty("buildDirectory");
    if (buildDirectory == null) {
      throw new RuntimeException("buildDirectory system property must be defined by Maven, aborting!");
    }
    Path targetDirectory = Paths.get(buildDirectory, "ditaa-" + ditaaVersion).toAbsolutePath();
    Path binPath = targetDirectory.resolve("ditaa");
    if (Files.isExecutable(binPath)) {
      String forceDownload = System.getenv("KROKI_FORCE_DOWNLOAD_DITAA");
      if (forceDownload == null || forceDownload.equalsIgnoreCase("false")) {
        System.out.println("Ditaa native image found at " + binPath + "; skipping download.");
        System.out.println("TIP: You can force download using KROKI_FORCE_DOWNLOAD_DITAA environment variable.");
        return binPath.toString();
      }
    }
    // anonymous pull from the GitHub Container Registry (OCI distribution API)
    HttpClient client = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NORMAL).build();
    String token = new JsonObject(get(client, "https://ghcr.io/token?scope=repository:" + REPOSITORY + ":pull", null, null))
      .getString("token");
    JsonObject index = new JsonObject(get(client, "https://ghcr.io/v2/" + REPOSITORY + "/manifests/" + ditaaVersion, token, "application/vnd.oci.image.index.v1+json"));
    String manifestDigest = index.getJsonArray("manifests").stream()
      .map(JsonObject.class::cast)
      .filter(manifest -> {
        JsonObject platform = manifest.getJsonObject("platform", new JsonObject());
        return "linux".equals(platform.getString("os")) && "amd64".equals(platform.getString("architecture"));
      })
      .map(manifest -> manifest.getString("digest"))
      .findFirst()
      .orElseThrow(() -> new IllegalStateException("No linux/amd64 image found for " + REPOSITORY + ":" + ditaaVersion));
    JsonObject manifest = new JsonObject(get(client, "https://ghcr.io/v2/" + REPOSITORY + "/manifests/" + manifestDigest, token, "application/vnd.oci.image.manifest.v1+json"));
    for (Object layer : manifest.getJsonArray("layers")) {
      String layerUrl = "https://ghcr.io/v2/" + REPOSITORY + "/blobs/" + ((JsonObject) layer).getString("digest");
      System.out.println("Downloading " + layerUrl + "...");
      HttpResponse<InputStream> response = client.send(request(layerUrl, token, null), HttpResponse.BodyHandlers.ofInputStream());
      if (response.statusCode() != 200) {
        throw new IOException("Request " + layerUrl + " failed with status code " + response.statusCode());
      }
      try (InputStream inputStream = new GZIPInputStream(response.body())) {
        untar(inputStream, targetDirectory);
      }
    }
    if (!Files.isExecutable(binPath)) {
      throw new IllegalStateException("Ditaa native image not found in " + REPOSITORY + ":" + ditaaVersion);
    }
    return binPath.toString();
  }

  private static HttpRequest request(String url, String token, String accept) {
    HttpRequest.Builder builder = HttpRequest.newBuilder(URI.create(url));
    if (token != null) {
      builder.header("Authorization", "Bearer " + token);
    }
    if (accept != null) {
      builder.header("Accept", accept);
    }
    return builder.build();
  }

  private static String get(HttpClient client, String url, String token, String accept) throws IOException, InterruptedException {
    HttpResponse<String> response = client.send(request(url, token, accept), HttpResponse.BodyHandlers.ofString());
    if (response.statusCode() != 200) {
      throw new IOException("Request " + url + " failed with status code " + response.statusCode() + ": " + response.body());
    }
    return response.body();
  }

  /**
   * Extracts the directories and regular files located in {@link #IMAGE_DIRECTORY} of a tar archive (layer).
   */
  private static void untar(InputStream inputStream, Path targetDirectory) throws IOException {
    DataInputStream tar = new DataInputStream(inputStream);
    byte[] header = new byte[512];
    while (true) {
      try {
        tar.readFully(header);
      } catch (EOFException e) {
        return;
      }
      String name = field(header, 0, 100);
      if (name.isEmpty()) {
        // end of archive
        return;
      }
      String prefix = field(header, 345, 155);
      if (!prefix.isEmpty()) {
        name = prefix + "/" + name;
      }
      int mode = Integer.parseInt(field(header, 100, 8).trim(), 8);
      long size = Long.parseLong(field(header, 124, 12).trim(), 8);
      char type = (char) header[156];
      long padding = (512 - size % 512) % 512;
      if (name.startsWith(IMAGE_DIRECTORY) && (type == '0' || type == '\0' || type == '5')) {
        Path path = targetDirectory.resolve(name.substring(IMAGE_DIRECTORY.length())).normalize();
        if (!path.startsWith(targetDirectory)) {
          throw new IOException("Entry is outside of the target dir: " + name);
        }
        if (type == '5') {
          Files.createDirectories(path);
        } else {
          Files.createDirectories(path.getParent());
          Files.copy(new BoundedInputStream(tar, size), path, StandardCopyOption.REPLACE_EXISTING);
          if ((mode & 0100) != 0 && !path.toFile().setExecutable(true)) {
            throw new IOException("Unable to make " + path + " executable!");
          }
          size = 0;
        }
      }
      skip(tar, size + padding);
    }
  }

  private static String field(byte[] header, int offset, int length) {
    int end = offset;
    while (end < offset + length && header[end] != 0) {
      end++;
    }
    return new String(header, offset, end - offset, StandardCharsets.US_ASCII);
  }

  private static void skip(DataInputStream inputStream, long count) throws IOException {
    byte[] buffer = new byte[8192];
    while (count > 0) {
      int read = inputStream.read(buffer, 0, (int) Math.min(buffer.length, count));
      if (read < 0) {
        throw new EOFException();
      }
      count -= read;
    }
  }

  private static class BoundedInputStream extends InputStream {
    private final InputStream inputStream;
    private long remaining;

    BoundedInputStream(InputStream inputStream, long size) {
      this.inputStream = inputStream;
      this.remaining = size;
    }

    @Override
    public int read() throws IOException {
      if (remaining <= 0) {
        return -1;
      }
      int b = inputStream.read();
      if (b >= 0) {
        remaining--;
      }
      return b;
    }

    @Override
    public int read(byte[] buffer, int offset, int length) throws IOException {
      if (remaining <= 0) {
        return -1;
      }
      int read = inputStream.read(buffer, offset, (int) Math.min(length, remaining));
      if (read > 0) {
        remaining -= read;
      }
      return read;
    }
  }
}
