<?php

function base64url_encode($data) {
  return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function encode($data) {
  return base64url_encode(gzcompress($data));
}
