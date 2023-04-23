package io.kroki.server.decode;

import io.kroki.server.decode.transcoder.Transcoder;
import io.kroki.server.error.DecodeException;
import io.kroki.server.decode.transcoder.TranscoderUtil;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

public class DiagramSource {

  public static String decode(String encoded) throws DecodeException {
    return decode(encoded, true);
  }

  public static String decode(String encoded, boolean trim) throws DecodeException {
    if (encoded == null || encoded.trim().isEmpty()) {
      throw new DecodeException("Unable to decode the source. Source must not be null or empty.");
    }
    try {
      byte[] source = Base64.getUrlDecoder().decode(encoded);
      String result = Zlib.decompress(source);
      if (trim) {
        return result.trim();
      }
      return result;
    } catch (IOException e) {
      throw new DecodeException("Unable to decode the source.", e);
    } catch (IllegalArgumentException e) {
      throw new DecodeException("Unable to decode the source. The source is not in valid Base64 scheme.", e);
    }
  }

  public static String plantumlDecode(String source) throws DecodeException {
    try {
      return unsafePlantumlDecode(source);
    } catch (UnsupportedEncodingException e) {
      throw new DecodeException("Characters must be encoded in UTF-8.", e);
    }
  }

  private static String unsafePlantumlDecode(String source) throws UnsupportedEncodingException, DecodeException {
    String text = URLDecoder.decode(source, StandardCharsets.UTF_8);
    try {
      Transcoder transcoder = TranscoderUtil.getDefaultTranscoder();
      text = transcoder.decode(text);
      // encapsulate the UML syntax if necessary
    } catch (ArrayIndexOutOfBoundsException | IOException e) {
      // Unable to decode with the PlantUML decoder, try the default decoder
      text = DiagramSource.decode(text);
    }
    return text;
  }

  public static byte[] encode(String decoded) {
    return Base64.getUrlEncoder().encode(Zlib.compress(decoded.getBytes()));
  }
}
