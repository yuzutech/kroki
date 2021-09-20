package io.kroki.server.decode;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

public class ZlibTest {

  @Test
  public void should_compress_decompress() throws IOException {
    String source = "digraph G {Hello->World; World->Hello;}";
    byte[] compressed = Zlib.compress(source.getBytes(StandardCharsets.UTF_8));
    String decompress = Zlib.decompress(compressed);
    assertThat(decompress).isEqualTo(source);
  }
}
