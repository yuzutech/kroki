FROM python:3.11.0-alpine3.16

RUN addgroup -g 1000 kroki && adduser -D -G kroki -u 1000 kroki

# add runtime dependency
RUN apk --update --no-cache add graphviz ttf-liberation && fc-cache -f

# ENV LIBRARY_PATH=/lib:/usr/lib

WORKDIR /usr/local/kroki

COPY --chown=kroki:kroki requirements.txt .

# build
RUN apk --update --no-cache add --virtual build-dependencies build-base python3-dev \
  && pip install --no-cache-dir -r requirements.txt \
  && apk del build-dependencies

COPY --chown=kroki:kroki src .

EXPOSE 8006

USER kroki

CMD ["gunicorn", "--preload", "--bind", "0.0.0.0:8006", "wsgi"]
