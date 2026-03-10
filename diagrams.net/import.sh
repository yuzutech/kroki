#!/bin/bash

set -euo pipefail
IFS=$'\n\t'

if [ $# -ne 2 ]; then
  echo "Usage: ${0} DRAWIODIR ASSETSDIR"
  exit 1
fi

DRAWIODIR=${1}
ASSETSDIR=${2}

rsync -avz --delete ${DRAWIODIR}/src/main/webapp/export3.html            ${ASSETSDIR}/index.html
rsync -avz --delete ${DRAWIODIR}/src/main/webapp/js/app.min.js           ${ASSETSDIR}/js/app.min.js
rsync -avz --delete ${DRAWIODIR}/src/main/webapp/js/shapes-14-6-5.min.js ${ASSETSDIR}/js/shapes-14-6-5.min.js
rsync -avz --delete ${DRAWIODIR}/src/main/webapp/export-fonts.css        ${ASSETSDIR}/export-fonts.css
rsync -avz --delete ${DRAWIODIR}/src/main/webapp/images/                 ${ASSETSDIR}/images
rsync -avz --delete ${DRAWIODIR}/src/main/webapp/img/                    ${ASSETSDIR}/img
#rsync -avz --delete ${DRAWIODIR}/src/main/webapp/math4/                  ${ASSETSDIR}/math4
rsync -avz --delete ${DRAWIODIR}/src/main/webapp/mxgraph/                ${ASSETSDIR}/mxgraph
rsync -avz --delete ${DRAWIODIR}/src/main/webapp/stencils/               ${ASSETSDIR}/stencils
rsync -avz --delete ${DRAWIODIR}/src/main/webapp/shapes/                 ${ASSETSDIR}/shapes
