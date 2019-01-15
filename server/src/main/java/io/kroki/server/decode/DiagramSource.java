package io.kroki.server.decode;

import java.io.IOException;
import java.util.Base64;

public class DiagramSource {

  public static String decode(String encoded) throws DecodeException {
    byte[] source = Base64.getUrlDecoder().decode(encoded);
    try {
      return Zlib.decompress(source).trim();
    } catch (IOException e) {
      throw new DecodeException("Unable to decode the source", e);
    }
  }

  public static byte[] encode(String decoded) throws IOException {
    return Base64.getUrlEncoder().encode(Zlib.compress(decoded.getBytes()));
  }
}
