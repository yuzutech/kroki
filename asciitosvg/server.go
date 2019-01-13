package main

import (
  "bytes"
  "compress/zlib"
  "encoding/base64"
  "github.com/asciitosvg/asciitosvg"
  "io"
  "log"
  "net/http"
  "strconv"
)

func decodeData(source string) ([]byte, error) {
  decodedSource, err := base64.URLEncoding.DecodeString(source)
  if err != nil {
    return nil, err
  }
  reader, err := zlib.NewReader(bytes.NewBuffer(decodedSource))
  if err != nil {
    return nil, err
  }
  var decompressedSource bytes.Buffer
  if _, err := io.Copy(&decompressedSource, reader); err != nil {
    return nil, err
  }
  if err := reader.Close(); err != nil {
    return nil, err
  }
  return decompressedSource.Bytes(), nil
}

func handler(responseWriter http.ResponseWriter, request *http.Request) {
	var tabWidth = 8
	var noBlur = false
	var font = "Consolas"
	var scaleX = 9
	var scaleY = 16

  encodedSource := request.URL.Path[len("/asciitosvg/"):]
  if len(encodedSource) > 0 {
    data, err := decodeData(encodedSource)
    if err != nil {
      log.Println("Unable to decode source: ", err)
      responseWriter.WriteHeader(400)
      if _, err := responseWriter.Write([]byte("Unable to decode source")); err != nil {
        log.Println(err)
        return
      }
      return
    }
    canvas, err := asciitosvg.NewCanvas(data, tabWidth)
    if err != nil {
      log.Println("Unable to convert: ", err)
      responseWriter.WriteHeader(400)
      if _, err := responseWriter.Write([]byte("Unable to convert")); err != nil {
        log.Println("Unable to write a response: ", err)
        return
      }
      return
    }
    svg := asciitosvg.CanvasToSVG(canvas, noBlur, font, scaleX, scaleY)
    responseWriter.Header().Set("Content-Type", "image/svg+xml")
    responseWriter.Header().Set("Content-Length", strconv.Itoa(len(svg)))
    if _, err := responseWriter.Write(svg); err != nil {
      log.Println("Unable to write a response: ", err)
    }
  } else {
    responseWriter.WriteHeader(204)
    if _, err := responseWriter.Write([]byte("Empty source")); err != nil {
      log.Println("Unable to write a response: ", err)
    }
  }
}

func main() {
	http.HandleFunc("/asciitosvg/", handler)
	log.Fatal(http.ListenAndServe(":8002", nil))
}
