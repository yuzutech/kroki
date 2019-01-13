package io.kroki.server;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Base64;
import java.util.zip.DataFormatException;

public class DiagramSource {

  public static String decode(String encoded) throws DecodeException {
    byte[] source = Base64.getUrlDecoder().decode(encoded);
    try {
      return Zlib.decompress(source);
    } catch (DataFormatException | UnsupportedEncodingException e) {
      throw new DecodeException("Unable to decode the source", e);
    }
  }

  public static byte[] encode(String decoded) throws IOException {
    return Base64.getUrlEncoder().encode(Zlib.compress(decoded.getBytes()));
  }
}
