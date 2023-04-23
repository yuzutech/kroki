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

public class LineLocationImpl implements LineLocation {
  // ::remove file when __HAXE__

  private final String desc;
  private final int position;
  private final LineLocation parent;

  public LineLocationImpl(String desc, LineLocation parent) {
    this(desc, parent, -1);
  }

  private LineLocationImpl(String desc, LineLocation parent, int position) {
    this.parent = parent;
    this.desc = Objects.requireNonNull(desc);
    this.position = position;
  }

  @Override
  public String toString() {
    return desc + " : " + position;
  }

  public LineLocationImpl oneLineRead() {
    return new LineLocationImpl(desc, parent, position + 1);
  }

  public int getPosition() {
    return position;
  }

  public String getDescription() {
    return desc;
  }

  public LineLocation getParent() {
    return parent;
  }

  private boolean isStandardLibrary() {
    return desc.startsWith("<");
  }

  public int compareTo(LineLocation other) {
    final LineLocationImpl other2 = (LineLocationImpl) other;
    if (this.isStandardLibrary() && !other2.isStandardLibrary()) {
      return -1;
    }
    if (!this.isStandardLibrary() && other2.isStandardLibrary()) {
      return 1;
    }
    return this.position - other2.position;
  }

}
