package main

import (
	"fmt"
	"log"
	"net/http"
	"rsc.io/quote"
	"github.com/asciitosvg/asciitosvg"
	"strconv"
)

func handler(w http.ResponseWriter, r *http.Request) {
	var input []byte
	var tabWidth = 8

	var noBlur = false
	var font = "Consolas"
	var scaleX = 9
	var scaleY = 16

	input = []byte(`
.-------------------------.
|                         |
| .---.-. .-----. .-----. |
| | .-. | +-->  | |  <--| |
| | '-' | |  <--| +-->  | |
| '---'-' '-----' '-----' |
|  ascii     2      svg   |
|                         |
'-------------------------'
`)
	canvas, err := asciitosvg.NewCanvas(input, tabWidth)
	if err != nil {
		fmt.Println(err)
	}
	svg := asciitosvg.CanvasToSVG(canvas, noBlur, font, scaleX, scaleY)
	w.Header().Set("Content-Type", "image/svg+xml")
	w.Header().Set("Content-Length", strconv.Itoa(len(svg)))
	if _, err := w.Write(svg); err != nil {
		log.Println("unable to write image.")
	}
}

func main() {
	fmt.Println(quote.Hello())
	http.HandleFunc("/", handler)
	log.Fatal(http.ListenAndServe(":8080", nil))
}
