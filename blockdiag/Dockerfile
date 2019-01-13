FROM python:3.7.2-alpine3.8

WORKDIR /usr/src/app

COPY requirements.txt ./

# install sys dependency for pillow
RUN apk add build-base python3-dev jpeg-dev zlib-dev fontconfig ttf-dejavu
ENV LIBRARY_PATH=/lib:/usr/lib

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["gunicorn", "--bind", "0.0.0.0:8001", "wsgi"]
