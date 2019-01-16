package io.kroki.server.decode;

import java.io.IOException;
import java.util.Base64;

public class DiagramSource {

  public static String decode(String encoded) throws DecodeException {
    return decode(encoded, true);
  }

  public static String decode(String encoded, boolean trim) throws DecodeException {
    byte[] source = Base64.getUrlDecoder().decode(encoded);
    try {
      String result = Zlib.decompress(source);
      if (trim) {
        return result.trim();
      }
      return result;
    } catch (IOException e) {
      throw new DecodeException("Unable to decode the source", e);
    }
  }

  public static byte[] encode(String decoded) throws IOException {
    return Base64.getUrlEncoder().encode(Zlib.compress(decoded.getBytes()));
  }
}
