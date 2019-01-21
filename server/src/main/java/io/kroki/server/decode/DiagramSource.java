package io.kroki.server.decode;

import io.kroki.server.error.BadRequestException;

import java.io.IOException;
import java.util.Base64;

public class DiagramSource {

  public static String decode(String encoded) {
    return decode(encoded, true);
  }

  public static String decode(String encoded, boolean trim) {
    try {
      byte[] source = Base64.getUrlDecoder().decode(encoded);
      String result = Zlib.decompress(source);
      if (trim) {
        return result.trim();
      }
      return result;
    } catch (IOException e) {
      throw new BadRequestException("Unable to decompress the source.", e);
    } catch (IllegalArgumentException e) {
      throw new BadRequestException("Unable to decode the source. The source is not in valid Base64 scheme.", e);
    }
  }

  public static byte[] encode(String decoded) throws IOException {
    return Base64.getUrlEncoder().encode(Zlib.compress(decoded.getBytes()));
  }
}
