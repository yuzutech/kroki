package io.kroki.server.service;

import java.util.Objects;

public class ServiceVersion {

  private String service;
  private String version;

  public ServiceVersion(String service, String version) {
    this.service = service;
    this.version = version;
  }

  public String getService() {
    return service;
  }

  public String getVersion() {
    return version;
  }

  public String toHTML(String template) {
    return template
      .replace("{service}", service)
      .replace("{version}", version);
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    ServiceVersion that = (ServiceVersion) o;
    return Objects.equals(service, that.service) &&
      Objects.equals(version, that.version);
  }

  @Override
  public int hashCode() {
    return Objects.hash(service, version);
  }
}
