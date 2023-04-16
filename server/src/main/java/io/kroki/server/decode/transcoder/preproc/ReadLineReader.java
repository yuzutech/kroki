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


import io.kroki.server.decode.transcoder.LineLocation;
import io.kroki.server.decode.transcoder.LineLocationImpl;
import io.kroki.server.decode.transcoder.StringLocated;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.Reader;

public class ReadLineReader implements ReadLine {

  private static final Logger logger = LoggerFactory.getLogger(ReadLineReader.class);
  private final BufferedReader br;
  private final String description;
  private LineLocationImpl location;

  private ReadLineReader(Reader reader, String description, LineLocation parent) {
    if (description == null)
      description = "?";

    this.br = new BufferedReader(reader);
    this.location = new LineLocationImpl(description, parent);
    this.description = description;
    logger.debug("Reading from " + description);
  }

  private ReadLineReader(Reader reader, String desc) {
    this(reader, desc, null);
  }

  public static ReadLine create(Reader reader, String description) {
    return new ReadLineReader(reader, description, null);
  }

  public static ReadLine create(Reader reader, String description, LineLocation parent) {
    return new ReadLineReader(reader, description, parent);
  }

  @Override
  public String toString() {
    return super.toString() + " " + description;
  }

  public StringLocated readLine() throws IOException {
    String s = br.readLine();
    location = location.oneLineRead();
    if (s == null)
      return null;

    if (s.startsWith("\uFEFF"))
      s = s.substring(1);

    s = s.replace('\u2013', '-');
    return new StringLocated(s, location);
  }

  public void close() throws IOException {
    br.close();
  }

}
