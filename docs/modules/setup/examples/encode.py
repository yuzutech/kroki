import sys;
import base64;
import zlib;

print(base64.urlsafe_b64encode(zlib.compress(sys.stdin.read(), 9)))
