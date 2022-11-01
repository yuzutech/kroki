package io.kroki.server;

import io.vertx.core.json.JsonObject;
import io.vertx.core.net.SocketAddress;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ServerConfigTest {

  @Test
  void throw_exception_when_non_ipv6_listen_address_contains_more_than_one_colon() {
    assertThatThrownBy(() -> Server.getListenAddress(new JsonObject().put("KROKI_LISTEN", "localhost:1234:5678")))
      .isInstanceOf(IllegalArgumentException.class)
      .hasMessageStartingWith("KROKI_LISTEN is not a valid listen address 'localhost:1234:5678', format must be: 'host:5678', ':5678', '1.2.3.4:5678', '[2041:0:140f::875b:131b]:5678' or '[2041:0:140f::875b:131b]'");
  }

  @Test
  void throw_exception_when_listen_address_contains_host_as_port() {
    assertThatThrownBy(() -> Server.getListenAddress(new JsonObject().put("KROKI_LISTEN", ":localhost")))
      .isInstanceOf(NumberFormatException.class)
      .hasMessageStartingWith("For input string: \"localhost\"");
  }

  @Test
  void throw_exception_when_listen_address_contains_ipv4_as_port() {
    assertThatThrownBy(() -> Server.getListenAddress(new JsonObject().put("KROKI_LISTEN", ":192.168.0.1")))
      .isInstanceOf(NumberFormatException.class)
      .hasMessageStartingWith("For input string: \"192.168.0.1\"");
  }

  @Test
  void throw_exception_when_listen_address_contains_an_empty_port() {
    assertThatThrownBy(() -> Server.getListenAddress(new JsonObject().put("KROKI_LISTEN", "localhost:")))
      .isInstanceOf(IllegalArgumentException.class)
      .hasMessageStartingWith("For input string: \"\"");
  }

  @Test
  void return_socket_address_when_listen_address_ipv6() {
    SocketAddress listenAddress = Server.getListenAddress(new JsonObject().put("KROKI_LISTEN", "[2001:db8:1f70::999:de8:7648:6e8]"));
    assertThat(listenAddress.host()).isEqualTo("[2001:db8:1f70::999:de8:7648:6e8]");
    assertThat(listenAddress.port()).isEqualTo(8000);
  }

  @Test
  void return_socket_address_when_listen_address_ipv4() {
    SocketAddress listenAddress = Server.getListenAddress(new JsonObject().put("KROKI_LISTEN", "192.168.0.1"));
    assertThat(listenAddress.host()).isEqualTo("192.168.0.1");
    assertThat(listenAddress.port()).isEqualTo(8000);
  }

  @Test
  void return_socket_address_when_listen_address_host() {
    SocketAddress listenAddress = Server.getListenAddress(new JsonObject().put("KROKI_LISTEN", "kroki.io"));
    assertThat(listenAddress.host()).isEqualTo("kroki.io");
    assertThat(listenAddress.port()).isEqualTo(8000);
  }

  @Test
  void return_socket_address_when_listen_address_default_ip() {
    SocketAddress listenAddress = Server.getListenAddress(new JsonObject().put("KROKI_LISTEN", "0.0.0.0"));
    assertThat(listenAddress.host()).isEqualTo("0.0.0.0");
    assertThat(listenAddress.port()).isEqualTo(8000);
  }

  @Test
  void return_socket_address_when_listen_address_any_ip() {
    SocketAddress listenAddress = Server.getListenAddress(new JsonObject().put("KROKI_LISTEN", "[::]"));
    assertThat(listenAddress.host()).isEqualTo("[::]");
    assertThat(listenAddress.port()).isEqualTo(8000);
  }

  @Test
  void return_socket_address_when_listen_address_contains_ipv6_port() {
    SocketAddress listenAddress = Server.getListenAddress(new JsonObject().put("KROKI_LISTEN", "[2001:db8::8a2e:370:7334]:1234"));
    assertThat(listenAddress.host()).isEqualTo("[2001:db8::8a2e:370:7334]");
    assertThat(listenAddress.port()).isEqualTo(1234);
  }

  @Test
  void return_socket_address_when_listen_address_localhost_port() {
    SocketAddress listenAddress = Server.getListenAddress(new JsonObject().put("KROKI_LISTEN", "localhost:1234"));
    assertThat(listenAddress.host()).isEqualTo("localhost");
    assertThat(listenAddress.port()).isEqualTo(1234);
  }

  @Test
  void return_socket_address_when_listen_address_domain_port() {
    SocketAddress listenAddress = Server.getListenAddress(new JsonObject().put("KROKI_LISTEN", "kroki.io:1234"));
    assertThat(listenAddress.host()).isEqualTo("kroki.io");
    assertThat(listenAddress.port()).isEqualTo(1234);
  }

  @Test
  void return_socket_address_when_listen_address_default_ip_port() {
    SocketAddress listenAddress = Server.getListenAddress(new JsonObject().put("KROKI_LISTEN", "0.0.0.0:2345"));
    assertThat(listenAddress.host()).isEqualTo("0.0.0.0");
    assertThat(listenAddress.port()).isEqualTo(2345);
  }

  @Test
  void return_socket_address_when_listen_address_local_ip_port() {
    SocketAddress listenAddress = Server.getListenAddress(new JsonObject().put("KROKI_LISTEN", "127.0.0.1:2345"));
    assertThat(listenAddress.host()).isEqualTo("127.0.0.1");
    assertThat(listenAddress.port()).isEqualTo(2345);
  }

  @Test
  void return_socket_address_when_listen_address_address_port() {
    SocketAddress listenAddress = Server.getListenAddress(new JsonObject().put("KROKI_LISTEN", ":3456"));
    assertThat(listenAddress.host()).isEqualTo("[::]"); // default host to listen on both IPv4 and IPv6
    assertThat(listenAddress.port()).isEqualTo(3456);
  }

  @Test
  void return_socket_address_when_listen_address_domain_sockets() {
    SocketAddress listenAddress = Server.getListenAddress(new JsonObject().put("KROKI_LISTEN", "unix:///var/run/kroki.sock"));
    assertThat(listenAddress.isDomainSocket()).isEqualTo(true);
  }
}
