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
package io.kroki.server.decode.transcoder.regex;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Matcher2 {

  private static final Logger logger = LoggerFactory.getLogger(Matcher2.class);
  private final static boolean INSTRUMENT = false;
  private static final Map<String, Long> durations = new HashMap<>();
  private static long printed;
  private final Matcher matcher;
  private final String id;

  private Matcher2(Matcher matcher, String id) {
    this.matcher = matcher;
    this.id = id;
  }

  public static Matcher2 build(Pattern pattern, CharSequence input) {
    final long now = System.currentTimeMillis();
    final String id = pattern.pattern();
    try {
      final Matcher matcher2 = pattern.matcher(input);
      return new Matcher2(matcher2, id);
    } finally {
      if (INSTRUMENT) {
        addTime(id, System.currentTimeMillis() - now);
      }
    }
  }

  private static synchronized void addTime(String id, long duration) {
    Long total = durations.get(id);
    if (total == null) {
      total = 0L;
    }
    total += duration;
    durations.put(id, total);
    final String longest = getLongest();
    if (longest == null) {
      return;
    }
    if (durations.get(longest) > printed) {
      logger.debug("---------- Regex " + longest + " " + durations.get(longest) + "ms (" + durations.size() + ")");
      printed = durations.get(longest);
    }

  }

  private static String getLongest() {
    long max = 0;
    String result = null;
    for (Map.Entry<String, Long> ent : durations.entrySet()) {
      if (ent.getValue() > max) {
        max = ent.getValue();
        result = ent.getKey();
      }
    }
    return result;
  }

  public boolean matches() {
    final long now = System.currentTimeMillis();
    try {
      return matcher.matches();
    } finally {
      addTime(System.currentTimeMillis() - now);
    }
  }

  private void addTime(long duration) {
    if (!INSTRUMENT) {
      return;
    }
    addTime(id, duration);
  }

  public String group(int n) {
    final long now = System.currentTimeMillis();
    try {
      return matcher.group(n);
    } finally {
      addTime(System.currentTimeMillis() - now);
    }
  }

  public String group() {
    final long now = System.currentTimeMillis();
    try {
      return matcher.group();
    } finally {
      addTime(System.currentTimeMillis() - now);
    }
  }

  public int groupCount() {
    final long now = System.currentTimeMillis();
    try {
      return matcher.groupCount();
    } finally {
      addTime(System.currentTimeMillis() - now);
    }
  }

  public boolean find() {
    final long now = System.currentTimeMillis();
    try {
      return matcher.find();
    } finally {
      addTime(System.currentTimeMillis() - now);
    }
  }

  public int end() {
    final long now = System.currentTimeMillis();
    try {
      return matcher.end();
    } finally {
      addTime(System.currentTimeMillis() - now);
    }
  }

  public int start() {
    final long now = System.currentTimeMillis();
    try {
      return matcher.start();
    } finally {
      addTime(System.currentTimeMillis() - now);
    }
  }
}
