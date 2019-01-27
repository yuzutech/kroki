FROM python:3.7.2-alpine3.8

WORKDIR /usr/src/app

ENV LIBRARY_PATH=/lib:/usr/lib

COPY requirements.txt /requirements.txt

# add runtime dependency
RUN apk --update add jpeg zlib fontconfig ttf-dejavu

# build
RUN apk --update add --virtual build-dependencies build-base python3-dev jpeg-dev zlib-dev\
  && pip install --no-cache-dir -r /requirements.txt \
  && apk del build-dependencies

COPY src .

EXPOSE 8001

CMD ["gunicorn", "--bind", "0.0.0.0:8001", "wsgi"]
