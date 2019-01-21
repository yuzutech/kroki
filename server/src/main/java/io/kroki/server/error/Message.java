package io.kroki.server.error;

import java.util.Collection;
import java.util.Iterator;

public class Message {

  public static String oneOf(Collection<String> data) {
    if (data == null || data.size() == 0) {
      return "";
    }
    StringBuilder sb = new StringBuilder();
    Iterator<String> iterator = data.iterator();
    if (iterator.hasNext()) {
      sb.append(iterator.next());
      while (iterator.hasNext()) {
        String value = iterator.next();
        if (iterator.hasNext()) {
          sb.append(", ").append(value);
        } else {
          sb.append(" or ").append(value);
        }
      }
    }
    return sb.toString();
  }

}
