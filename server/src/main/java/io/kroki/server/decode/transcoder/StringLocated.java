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
package io.kroki.server.decode.transcoder;

import java.util.Objects;

final public class StringLocated {
  // ::remove folder when __HAXE__

  private final String s;
  private final LineLocation location;
  private final String preprocessorError;

  private StringLocated trimmed;
  private long fox = -1;
  private TLineType type;

  public StringLocated(String s, LineLocation location) {
    this(s, location, null);
  }

  public StringLocated(String s, LineLocation location, String preprocessorError) {
    this.s = Objects.requireNonNull(s);
    this.location = location;
    this.preprocessorError = preprocessorError;
  }

  public static boolean endsWithBackslash(final String s) {
    return s.endsWith("\\") && !s.endsWith("\\\\");
  }

  private static String trin(String arg) {
    if (arg.length() == 0)
      return arg;

    return trinEndingInternal(arg, getPositionStartNonSpace(arg));
  }

  private static int getPositionStartNonSpace(String arg) {
    int i = 0;
    while (i < arg.length() && isSpaceOrTabOrNull(arg.charAt(i)))
      i++;

    return i;
  }

  private static String trinEndingInternal(String arg, int from) {
    int j = arg.length() - 1;
    while (j >= from && isSpaceOrTabOrNull(arg.charAt(j)))
      j--;

    if (from == 0 && j == arg.length() - 1)
      return arg;

    return arg.substring(from, j + 1);
  }

  private static boolean isSpaceOrTabOrNull(char c) {
    return c == ' ' || c == '\t' || c == '\r' || c == '\n' || c == '\0';
  }

  @Override
  public String toString() {
    return s;
  }

  public StringLocated append(String endOfLine) {
    return new StringLocated(s + endOfLine, location, preprocessorError);
  }

  public StringLocated mergeEndBackslash(StringLocated next) {
    if (!endsWithBackslash(s))
      throw new IllegalArgumentException();

    return new StringLocated(s.substring(0, s.length() - 1) + next.s, location, preprocessorError);
  }

  public StringLocated withErrorPreprocessor(String preprocessorError) {
    return new StringLocated(s, location, preprocessorError);
  }

  public StringLocated substring(int start, int end) {
    return new StringLocated(this.getString().substring(start, end), this.getLocation(),
      this.getPreprocessorError());
  }

  public StringLocated substring(int start) {
    return new StringLocated(this.getString().substring(start), this.getLocation(), this.getPreprocessorError());
  }

  public StringLocated getTrimmed() {
    if (trimmed == null) {
      this.trimmed = new StringLocated(trin(this.getString()), location, preprocessorError);
      trimmed.fox = this.fox;
      trimmed.trimmed = trimmed;
    }
    return trimmed;
  }

  public StringLocated removeInnerComment() {
    final String string = s;
    final String trim = string.replace('\t', ' ').trim();
    if (trim.startsWith("/'")) {
      final int idx = string.indexOf("'/");
      if (idx != -1)
        return new StringLocated(removeSpecialInnerComment(s.substring(idx + 2)), location,
          preprocessorError);

    }
    if (trim.endsWith("'/")) {
      final int idx = string.lastIndexOf("/'");
      if (idx != -1)
        return new StringLocated(removeSpecialInnerComment(s.substring(0, idx)), location, preprocessorError);

    }
    if (trim.contains("/'''") && trim.contains("'''/"))
      return new StringLocated(removeSpecialInnerComment(s), location, preprocessorError);

    return this;
  }

  private String removeSpecialInnerComment(String s) {
    if (s.contains("/'''") && s.contains("'''/"))
      return s.replaceAll("/'''[-\\w]*'''/", "");

    return s;
  }

  public String getString() {
    return s;
  }

  public LineLocation getLocation() {
    return location;
  }

  public String getPreprocessorError() {
    return preprocessorError;
  }

  public long getFoxSignature() {
    if (fox == -1)
      fox = FoxSignature.getFoxSignatureFromRealString(getString());

    return fox;
  }

  public TLineType getType() {
    if (type == null)
      type = TLineType.getFromLineInternal(s);

    return type;
  }

  public int length() {
    return s.length();
  }

}
