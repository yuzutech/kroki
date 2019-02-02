package io.kroki.server.service;

public class ServiceVersion {

  private String service;
  private String version;

  public ServiceVersion(String service, String version) {
    this.service = service;
    this.version = version;
  }

  public String toHTML(String template) {
    return template
      .replace("{service}", service)
      .replace("{version}", version);
  }
}
