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

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.zip.ZipInputStream;

public class CompressionZip implements Compression {
  // ::remove file when __CORE__

  public byte[] compress(byte[] in) {
    throw new UnsupportedOperationException();
  }

  public ByteArray decompress(byte[] input) throws NoPlantumlCompressionException {
    try {
      try (final ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(input))) {
        final byte[] buffer = new byte[10_000];
        try (final ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
          int len;
          while ((len = zis.read(buffer)) > 0) {
            baos.write(buffer, 0, len);
            if (baos.size() > 200_000)
              throw new NoPlantumlCompressionException("Zip error");
          }
          return ByteArray.from(baos.toByteArray());
        }
      }
    } catch (IOException e) {
      throw new NoPlantumlCompressionException(e);
    }
  }
}
