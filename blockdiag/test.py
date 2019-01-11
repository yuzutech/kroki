import base64
import zlib

blockdiag_sample = """
blockdiag {
 blockdiag -> generates -> "block-diagrams";
 blockdiag -> is -> "very easy!";

 blockdiag [color = "greenyellow"];
 "block-diagrams" [color = "pink"];
 "very easy!" [color = "orange"];
}
"""

print base64.urlsafe_b64encode(zlib.compress(blockdiag_sample, 9))

seqdiag_sample = """
seqdiag {
  browser  -> webserver [label = "GET /index.html"];
  browser <-- webserver;
  browser  -> webserver [label = "POST /blog/comment"];
              webserver  -> database [label = "INSERT comment"];
              webserver <-- database;
  browser <-- webserver;
}
"""

print base64.urlsafe_b64encode(zlib.compress(seqdiag_sample, 9))
