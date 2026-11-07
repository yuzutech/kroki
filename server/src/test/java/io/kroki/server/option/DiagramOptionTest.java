package io.kroki.server.option;

import io.kroki.server.format.FileFormat;
import io.vertx.core.json.JsonObject;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThatNullPointerException;

class DiagramOptionTest {

  @Test
  void flagFactoryCreatesFlagOption() {
    DiagramOption option = DiagramOption.flag("enabled", "Enable the feature.");

    assertThat(option.name()).isEqualTo("enabled");
    assertThat(option.description()).isEqualTo("Enable the feature.");
    assertThat(option.values()).isEmpty();
    assertThat(option.defaultValue()).isNull();
    assertThat(option.formats()).isEmpty();
  }

  @Test
  void valueFactoryCreatesValueOption() {
    DiagramOption option = DiagramOption.value("scale", "Scale factor.");

    assertThat(option.name()).isEqualTo("scale");
    assertThat(option.description()).isEqualTo("Scale factor.");
    assertThat(option.values()).isEmpty();
    assertThat(option.defaultValue()).isNull();
    assertThat(option.formats()).isEmpty();
  }

  @Test
  void oneOfFactoryStoresAllowedValues() {
    DiagramOption option = DiagramOption.oneOf("layout", "Layout engine.", "dot", "neato");

    assertThat(option.name()).isEqualTo("layout");
    assertThat(option.description()).isEqualTo("Layout engine.");
    assertThat(option.values()).containsExactly("dot", "neato");
    assertThat(option.defaultValue()).isNull();
    assertThat(option.formats()).isEmpty();
  }

  @Test
  void prefixFactoryCreatesPrefixOption() {
    DiagramOption option = DiagramOption.prefix("node-attribute-", "Default node attribute.");

    assertThat(option.name()).isEqualTo("node-attribute-");
    assertThat(option.description()).isEqualTo("Default node attribute.");
    assertThat(option.values()).isEmpty();
    assertThat(option.defaultValue()).isNull();
    assertThat(option.formats()).isEmpty();
  }

  @Test
  void withDefaultReturnsCopyWithDefault() {
    DiagramOption original = DiagramOption.value("theme", "Theme name.");
    DiagramOption withDefault = original.withDefault("dark");

    assertThat(original.defaultValue()).isNull();
    assertThat(withDefault.name()).isEqualTo("theme");
    assertThat(withDefault.description()).isEqualTo("Theme name.");
    assertThat(withDefault.values()).isEmpty();
    assertThat(withDefault.defaultValue()).isEqualTo("dark");
    assertThat(withDefault.formats()).isEmpty();
  }

  @Test
  void onlyForReturnsCopyRestrictedToFormats() {
    DiagramOption original = DiagramOption.flag("no-doctype", "Omit the SVG doctype.");
    DiagramOption onlyForSvg = original.onlyFor(FileFormat.SVG);

    assertThat(original.formats()).isEmpty();
    assertThat(onlyForSvg.name()).isEqualTo("no-doctype");
    assertThat(onlyForSvg.description()).isEqualTo("Omit the SVG doctype.");
    assertThat(onlyForSvg.values()).isEmpty();
    assertThat(onlyForSvg.defaultValue()).isNull();
    assertThat(onlyForSvg.formats()).containsExactly(FileFormat.SVG);
  }

  @Test
  void withDefaultAndOnlyForPreserveOtherProperties() {
    DiagramOption option = DiagramOption.oneOf("output", "Output type.", "diagram", "legend")
      .withDefault("diagram")
      .onlyFor(FileFormat.SVG, FileFormat.PDF);

    assertThat(option.values()).containsExactly("diagram", "legend");
    assertThat(option.defaultValue()).isEqualTo("diagram");
    assertThat(option.formats()).containsExactlyInAnyOrder(FileFormat.SVG, FileFormat.PDF);
  }

  @Test
  void getReturnsValueForNamedOption() {
    DiagramOption option = DiagramOption.value("scale", "Scale factor.");

    assertThat(option.get(JsonObject.of("scale", "2"))).isEqualTo("2");
    assertThat(option.get(new JsonObject())).isNull();
  }

  @Test
  void isEnabledReflectsWhetherNamedOptionHasValue() {
    DiagramOption option = DiagramOption.flag("enabled", "Enable the feature.");

    assertThat(option.isEnabled(JsonObject.of("enabled", "false"))).isTrue();
    assertThat(option.isEnabled(new JsonObject())).isFalse();
  }

  @Test
  void isEnabledForFlagWithEmptyValue() {
    DiagramOption option = DiagramOption.flag("antialias", "Enable antialiasing.");

    assertThat(option.isEnabled(JsonObject.of("antialias", ""))).isTrue();
    assertThat(option.getAll(JsonObject.of("antialias", "")))
      .containsExactly(Map.entry("antialias", ""));
  }

  @Test
  void constructorRequiresNameAndKind() {
    assertThatNullPointerException()
      .isThrownBy(() -> new DiagramOption(null, null, "description", List.of(), null, Set.of()));
    assertThatNullPointerException()
      .isThrownBy(() -> new DiagramOption("name", null, "description", List.of(), null, Set.of()));
  }

  @Test
  void factoryCollectionsAreImmutable() {
    DiagramOption option = DiagramOption.oneOf("layout", "Layout engine.", "one", "two")
      .onlyFor(FileFormat.SVG);

    assertThat(option.values()).containsExactly("one", "two");
    assertThat(option.formats()).containsExactly(FileFormat.SVG);
    assertThatThrownBy(() -> option.values().add("three"))
      .isInstanceOf(UnsupportedOperationException.class);
    assertThatThrownBy(() -> option.formats().add(FileFormat.PDF))
      .isInstanceOf(UnsupportedOperationException.class);
  }

  @Test
  void getAllReturnsFlagValue() {
    DiagramOption option = DiagramOption.flag("enabled", "Enable the feature.");

    assertThat(option.getAll(JsonObject.of("enabled", "true")))
      .containsExactly(Map.entry("enabled", "true"));
  }

  @Test
  void getAllReturnsValueOption() {
    DiagramOption option = DiagramOption.value("scale", "Scale factor.");

    assertThat(option.getAll(JsonObject.of("scale", "2")))
      .containsExactly(Map.entry("scale", "2"));
  }

  @Test
  void getAllReturnsEnumOption() {
    DiagramOption option = DiagramOption.oneOf("layout", "Layout engine.", "dot", "neato");

    assertThat(option.getAll(JsonObject.of("layout", "neato")))
      .containsExactly(Map.entry("layout", "neato"));
  }

  @Test
  void getAllReturnsPrefixSuffixesAndValues() {
    DiagramOption option = DiagramOption.prefix("node-attribute-", "Default node attribute.");
    JsonObject options = JsonObject.of(
      "node-attribute-shape", "box",
      "node-attribute-color", "blue",
      "graph-attribute-rankdir", "LR"
    );

    assertThat(option.getAll(options))
      .containsExactly(Map.entry("shape", "box"), Map.entry("color", "blue"));
  }

  @Test
  void getAllReturnsEmptyMapWhenOptionIsMissing() {
    assertThat(DiagramOption.value("scale", "Scale factor.").getAll(new JsonObject())).isEmpty();
    assertThat(DiagramOption.prefix("node-attribute-", "Default node attribute.").getAll(new JsonObject())).isEmpty();
  }

  @Test
  void getAllOmitsPrefixWithoutSuffix() {
    DiagramOption option = DiagramOption.prefix("node-attribute-", "Default node attribute.");

    assertThat(option.getAll(JsonObject.of("node-attribute-", "unused"))).isEmpty();
  }
}
