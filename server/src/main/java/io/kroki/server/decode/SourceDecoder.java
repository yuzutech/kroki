package io.kroki.server.decode;

import io.kroki.server.error.DecodeException;

public abstract class SourceDecoder {
  public abstract String decode(String encoded) throws DecodeException;
}
