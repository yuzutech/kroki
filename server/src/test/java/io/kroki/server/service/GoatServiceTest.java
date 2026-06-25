package io.kroki.server.service;

import io.kroki.server.action.Commander;
import io.kroki.server.decode.DiagramSource;
import io.kroki.server.error.DecodeException;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.junit5.VertxExtension;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(VertxExtension.class)
public class GoatServiceTest {

  private static Goat newGoat(Vertx vertx) {
    JsonObject config = new JsonObject();
    return new Goat(vertx, config, new Commander(config));
  }

  @Test
  public void should_preserve_leading_whitespace_on_the_first_line(Vertx vertx) throws DecodeException {
    // GoAT is whitespace-sensitive: the first line is indented by 4 spaces just
    // like the others. Trimming the source would strip that indentation, shifting
    // the top border to x=0 and misaligning the box.
    String source = "    .------------.\n" +
      "o-->|Hello, world|--*\n" +
      "    '------------'\n";
    String encoded = new String(DiagramSource.encode(source));

    String decoded = newGoat(vertx).getSourceDecoder().decode(encoded);

    assertThat(decoded).isEqualTo(source);
    assertThat(decoded).startsWith("    .");
  }
}