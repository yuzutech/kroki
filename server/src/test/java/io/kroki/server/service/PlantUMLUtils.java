package io.kroki.server.service;

public class PlantUMLUtils {
  public static String stripComments(String xmlContent) {
    return stripPlantUMLComments(xmlContent).replaceAll("<!--[\\s\\S]*?-->", "");
  }

  private static String stripPlantUMLComments(String xmlContent) {
    return xmlContent.replaceAll("<\\?plantuml(-src)? [^?]+\\?>", "");
  }
}
