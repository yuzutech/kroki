package main

import (
	"bytes"
	"compress/zlib"
	"encoding/base64"

	"github.com/pkg/errors"
)

// Encode takes a string and returns an encoded string in deflate + base64 format
func Encode(input string) (string, error) {
	var buffer bytes.Buffer
	writer, err := zlib.NewWriterLevel(&buffer, 9)
	if err != nil {
		return "", errors.Wrap(err, "fail to create the writer")
	}
	_, err = writer.Write([]byte(input))
	writer.Close()
	if err != nil {
		return "", errors.Wrap(err, "fail to create the payload")
	}
	result := base64.URLEncoding.EncodeToString(buffer.Bytes())
	return result, nil
}
