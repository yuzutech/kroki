/* ========================================================================
 * PlantUML : a free UML diagram generator
 * ========================================================================
 *
 * (C) Copyright 2009-2024, Arnaud Roques
 *
 * Project Info:  https://plantuml.com
 *
 * If you like this project or if you find it useful, you can support us at:
 *
 * https://plantuml.com/patreon (only 1$ per month!)
 * https://plantuml.com/paypal
 *
 * This file is part of PlantUML.
 *
 * PlantUML is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * PlantUML distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
 * License for more details.
 *
 * You should have received a copy of the GNU General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301,
 * USA.
 *
 *
 * Original Author:  Arnaud Roques
 *
 *
 */
package io.kroki.server.decode.transcoder.preproc;

import io.kroki.server.decode.transcoder.StringLocated;
import io.kroki.server.decode.transcoder.regex.Matcher2;
import io.kroki.server.decode.transcoder.regex.MyPattern;
import io.kroki.server.decode.transcoder.regex.Pattern2;

import java.io.IOException;

public class UncommentReadLine implements ReadLine {

  public static final String PAUSE_PATTERN = "((?:\\W|\\<[^<>]*\\>)*)[@\\\\]unpause";

  private static final Pattern2 unpause = MyPattern.cmpile(PAUSE_PATTERN);

  private final ReadLine raw;
  private String headerToRemove;
  private boolean paused;

  public UncommentReadLine(ReadLine source) {
    this.raw = source;
  }

  public static String beforeStartUml(final String s) {
    boolean inside = false;
    for (int i = 0; i < s.length(); i++) {
      final String tmp = s.substring(i);
      if (startsWithSymbolAnd("start", tmp)) {
        return s.substring(0, i);
      }
      final String single = s.substring(i, i + 1);
      if (inside) {
        if (single.equals(">")) {
          inside = false;
        }
        continue;
      }
      if (single.equals("<")) {
        inside = true;
      } else if (single.matches("[\\w~]")) {
        return null;
      }
    }
    return null;
  }

  public static boolean startsWithSymbolAnd(String value, final String tmp) {
    return tmp.startsWith("@" + value) || tmp.startsWith("\\" + value);
  }

  public StringLocated readLine() throws IOException {
    final StringLocated result = raw.readLine();

    if (result == null) {
      return null;
    }

    final String tmp = beforeStartUml(result.getString());
    if (tmp != null) {
      headerToRemove = tmp;
    }
    if (paused) {
      final Matcher2 m2 = unpause.matcher(result.getString());
      if (m2.find()) {
        headerToRemove = m2.group(1);
      }
    }
    if (headerToRemove != null && headerToRemove.startsWith(result.getString())) {
      return new StringLocated("", result.getLocation());
    }
    if (headerToRemove != null && result.getString().startsWith(headerToRemove)) {
      return result.substring(headerToRemove.length(), result.getString().length());
    }
    return result;
  }

  public void close() throws IOException {
    this.raw.close();
  }

  public void setPaused(boolean paused) {
    this.paused = paused;
  }
}
