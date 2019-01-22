package io.kroki.server.decode;

import io.kroki.server.error.DecodeException;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

public class DiagramSourceTest {

  @Test
  public void should_throw_when_source_encoded_is_empty() {
    assertThatThrownBy(() -> DiagramSource.decode(""))
      .isInstanceOf(DecodeException.class)
      .hasMessageContaining("Unable to decode the source.");
  }

  @Test
  public void should_throw_when_source_encoded_is_null() {
    assertThatThrownBy(() -> DiagramSource.decode(null))
      .isInstanceOf(DecodeException.class)
      .hasMessageContaining("Unable to decode the source.");
  }

  @Test
  public void should_throw_when_source_encoded_only_contains_spaces() {
    assertThatThrownBy(() -> DiagramSource.decode("    "))
      .isInstanceOf(DecodeException.class)
      .hasMessageContaining("Unable to decode the source.");
  }

  @Test
  public void should_throw_when_source_encoded_is_invalid() {
    assertThatThrownBy(() -> DiagramSource.decode("abc"))
      .isInstanceOf(DecodeException.class)
      .hasMessageContaining("Unable to decode the source.");
  }

  @Test
  public void should_throw_when_source_is_not_utf8_encoded() {
    assertThatThrownBy(() -> DiagramSource.decode(new String(Base64.getDecoder().decode("gAID"))))
      .isInstanceOf(DecodeException.class)
      .hasMessageContaining("Unable to decode the source.")
      .hasCauseInstanceOf(IllegalArgumentException.class)
      .hasStackTraceContaining("java.lang.IllegalArgumentException: Illegal base64 character 3f");
  }

  @Test
  public void should_decode_valid_plantuml_encoded_source_with_plantuml_encoder() throws DecodeException {
    String sourceDecoded = DiagramSource.plantumlDecode("SyfFKj2rKt3CoKnELR1Io4ZDoSa70000");
    assertThat(sourceDecoded).isEqualTo("@startuml\nBob -> Alice : hello\n@enduml");
  }

  @Test
  public void should_decode_valid_plantuml_encoded_source_with_default_encoder() throws DecodeException {
    String sourceDecoded = DiagramSource.plantumlDecode("eNrjciguSSwqKc3N4XLKT1LQtVNwzMlMTlWwUshIzcnJ53JIzUsBSQIABnMM1A==");
    assertThat(sourceDecoded).isEqualTo("@startuml\nBob -> Alice : hello\n@enduml");
  }

  @Test
  public void should_not_trim() throws IOException, DecodeException {
    String source = "\n" +
      "    +----------+\n" +
      "    |   FAQ:   |\n" +
      "    +----------+\n";
    String sourceEncoded = new String(DiagramSource.encode(source));
    assertThat(DiagramSource.decode(sourceEncoded, false)).isEqualTo(source);
  }
}
