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

import io.kroki.server.decode.transcoder.zopfli.Options;
import io.kroki.server.decode.transcoder.zopfli.Options.BlockSplitting;
import io.kroki.server.decode.transcoder.zopfli.Options.OutputFormat;
import io.kroki.server.decode.transcoder.zopfli.Zopfli;

public class CompressionZopfliZlib implements Compression {
  // ::remove file when __CORE__

  public byte[] compress(byte[] in) {
    if (in.length == 0)
      return null;

    int len = in.length * 2;
    if (len < 100)
      len = 100;

    final Zopfli compressor = new Zopfli(len);
    final Options options = new Options(OutputFormat.DEFLATE, BlockSplitting.FIRST, 30);

    return compressor.compress(options, in).getResult();
  }

  public ByteArray decompress(byte[] in) throws NoPlantumlCompressionException {
    return new CompressionZlib().decompress(in);
  }

}
