# Diagrams.net server

Version: 29.6.1

## Update

Clone the https://github.com/jgraph/drawio repository and checkout a tag.
Replace the following files and directories:

| Source                             | Destination               |
|------------------------------------|---------------------------|
| `src/main/webapp/export3.html`     | `assets/index.html`       |
| `src/main/webapp/images`           | `assets/images`           |
| `src/main/webapp/img`              | `assets/img`              |
| `src/main/webapp/math4`            | `assets/math4`            |
| `src/main/webapp/mxgraph`          | `assets/mxgraph`          |
| `src/main/webapp/shapes`           | `assets/shapes`           |
| `src/main/webapp/stencils`         | `assets/stencils`         |
| `src/main/webapp/export-fonts.css` | `assets/export-fonts.css` |

You can also use the `import.sh` script to perform the sync:

```bash
$ ./import.sh /path/to/drawio/checkout assets/
```
