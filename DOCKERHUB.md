# Kroki

Convert plain text diagrams to images !

Kroki provides a unified API with support for BlockDiag (BlockDiag, SeqDiag, ActDiag, NwDiag, PacketDiag, RackDiag), BPMN, Bytefield, C4 (with PlantUML), D2, DBML, Ditaa, Erd, Excalidraw, GraphViz, Mermaid, Nomnoml, Pikchr, PlantUML, SvgBob, Symbolator, UMLet, Vega, Vega-Lite, WaveDrom... and more to come!

## Getting Started

### Prerequisites

In order to run this container you'll need docker installed.

* [Windows](https://docs.docker.com/docker-for-windows/)
* [OS X](https://docs.docker.com/docker-for-mac/)
* [Linux](https://docs.docker.com/get-started/)

### Usage

See also the [installation](https://docs.kroki.io/kroki/setup/configuration/) docs in the [Kroki documentation](https://docs.kroki.io/)

#### start a kroki instance

    $ docker run --name some-kroki -d yuzutech/kroki

This image includes `EXPOSE 8000` (the kroki port), so standard container linking will make it automatically available to the linked containers. If you want to map port 8000 in the container to a port on your host, please use the `--publish` or `-p` flag:

    $ docker run -p8000:8000 --name some-kroki -d yuzutech/kroki

#### connect with companion containers

We recommend using docker-composer to connect with companion containers, such as 
[kroki-bpmn](https://hub.docker.com/r/yuzutech/kroki-bpmn), [kroki-excalidraw](https://hub.docker.com/r/yuzutech/kroki-excalidraw) and [kroki-mermaid](https://hub.docker.com/r/yuzutech/kroki-mermaid)
```
version: "3"
services:
  core:
    image: yuzutech/kroki
    environment:
      - KROKI_MERMAID_HOST=mermaid
      - KROKI_BPMN_HOST=bpmn
      - KROKI_EXCALIDRAW_HOST=excalidraw
      - KROKI_WIREVIZ_HOST=wireviz
    ports:
      - "8000:8000"
  mermaid:
    image: yuzutech/kroki-mermaid
    ports:
      - "8002:8002"
  bpmn:
    image: yuzutech/kroki-bpmn
    ports:
      - "8003:8003"
  excalidraw:
    image: yuzutech/kroki-excalidraw
    ports:
      - "8004:8004"
  wireviz:
    image: yuzutech/kroki-wireviz
    ports:
      - "8006:8006"
```

If you don't want to use `docker-compose`, you can configure the host and port for each companion container using environment variables:

| Container          | Host                    | Port                    |
|--------------------|-------------------------|-------------------------|
| `kroki-mermaid`    | `KROKI_MERMAID_HOST`    | `KROKI_MERMAID_PORT`    |
| `kroki-bpmn`       | `KROKI_BPMN_HOST`       | `KROKI_BPMN_PORT`       |
| `kroki-excalidraw` | `KROKI_EXCALIDRAW_HOST` | `KROKI_EXCALIDRAW_PORT` |
| `kroki-wireviz`    | `KROKI_WIREVIZ_HOST`    | `KROKI_WIREVIZ_PORT`    |

For Kubernetes installation follow the description in [install using Kubernetes](https://docs.kroki.io/kroki/setup/install/#_using_kubernetes) section.

### Environment Variables

The Kroki image uses several environment variables. While none of the variables are required, they may significantly aid you in using the image.

See the [configuration](https://docs.kroki.io/kroki/setup/configuration/) docs in the [Kroki documentation](https://docs.kroki.io/)

## Versioning

We use [SemVer](https://semver.org/) for versioning.

## License

This project is licensed under the MIT License.
