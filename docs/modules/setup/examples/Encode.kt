package main

import java.util.Base64
import java.util.zip.Deflater

object Encode {

  fun encode(decoded: String): String =
    String(Base64.getUrlEncoder().encode(compress(decoded.toByteArray())), Charsets.UTF_8)

  private fun compress(source: ByteArray): ByteArray {
    val deflater = Deflater()
    deflater.setInput(source)
    deflater.finish()
    val bytesCompressed = ByteArray(Short.MAX_VALUE.toInt())
    val numberOfBytesAfterCompression = deflater.deflate(bytesCompressed)
    val returnValues = ByteArray(numberOfBytesAfterCompression)
    System.arraycopy(bytesCompressed, 0, returnValues, 0, numberOfBytesAfterCompression)
    return returnValues
  }
}
