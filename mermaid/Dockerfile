FROM node:24.19-alpine3.24

# Keep in sync with the KROKI_MERMAID_MERMAIDX_SPEC default in src/worker-mermaidx.js.
ARG MERMAIDX_SPEC="mermaidx==0.9.5"

RUN addgroup -g 1001 kroki && adduser -D -G kroki -u 1001 kroki

# uv provides `uvx` for the default mermaidx renderer (see renderer.js).
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

RUN apk add --quiet --no-cache --update \
  chromium \
  python3 \
  font-noto-cjk

RUN mkdir -p /usr/share/fonts/truetype/google-fonts
COPY --chown=kroki:kroki fonts /usr/share/fonts/truetype/google-fonts
RUN fc-cache -f && rm -rf /var/cache/*

RUN mkdir -p /usr/local/kroki/node && chown kroki:kroki -R /usr/local/kroki
RUN mkdir -p /usr/local/kroki/.cache/uv && chown kroki:kroki /usr/local/kroki/.cache/uv

USER kroki
WORKDIR /usr/local/kroki/

ENV KROKI_MERMAID_RENDERER="puppeteer"
ENV KROKI_MERMAID_MERMAIDX_SPEC=${MERMAIDX_SPEC}
ENV UV_CACHE_DIR=/usr/local/kroki/.cache/uv
ENV KROKI_MERMAID_PAGE_URL=file:///usr/local/kroki/assets/index.html
ENV PUPPETEER_EXECUTABLE_PATH=/usr/lib/chromium/chrome
#ENV DEBUG="puppeteer:*"
ENV LEVEL="info"
ENV XDG_CONFIG_HOME="/tmp/config"
ENV XDG_CACHE_HOME="/tmp/cache"

COPY --chown=kroki:kroki src ./src
COPY --chown=kroki:kroki package*.json ./
COPY --chown=kroki:kroki assets ./assets

# Shared package resolved through the file:../lib/browser-instance dependency
# ("lib" named build context, see docker-bake.hcl)
COPY --from=lib --chown=kroki:kroki . /usr/local/lib/browser-instance

RUN npm i --omit=dev

# Pre-warm the uv cache so the first opt-in render isn't cold. The default
# renderer stays headless Chromium; select mermaidx at runtime with
# KROKI_MERMAID_RENDERER=mermaidx (see src/renderer.js).
RUN uvx --from "${KROKI_MERMAID_MERMAIDX_SPEC}" mermaidx --version

EXPOSE 8002

ENTRYPOINT ["node", "src/index.js"]
