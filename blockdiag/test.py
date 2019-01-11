import base64
import zlib
import re

blockdiag_sample = """
blockdiag {
 blockdiag -> generates -> "block-diagrams";
 blockdiag -> is -> "very easy!";

 blockdiag [color = "greenyellow"];
 "block-diagrams" [color = "pink"];
 "very easy!" [color = "orange"];
}
"""

print '/blockdiag/png/' + base64.urlsafe_b64encode(zlib.compress(blockdiag_sample, 9))

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

print '/seqdiag/png/' + base64.urlsafe_b64encode(zlib.compress(seqdiag_sample, 9))


actdiag_sample = """
actdiag {
  write -> convert -> image

  lane user {
     label = "User"
     write [label = "Writing reST"];
     image [label = "Get diagram IMAGE"];
  }
  lane actdiag {
     convert [label = "Convert reST to Image"];
  }
}
"""

actdiag_sample1 = """
{
  write -> convert -> image

  lane user {
     label = "User"
     write [label = "Writing reST"];
     image [label = "Get diagram IMAGE"];
  }
  lane actdiag {
     convert [label = "Convert reST to Image"];
  }
}
"""

print '/png/' + base64.urlsafe_b64encode(zlib.compress(actdiag_sample, 9))
print '/actdiag/png/' + base64.urlsafe_b64encode(zlib.compress(actdiag_sample1, 9))

nwdiag_sample = """
nwdiag {
  network dmz {
      address = "210.x.x.x/24"

      web01 [address = "210.x.x.1"];
      web02 [address = "210.x.x.2"];
  }
  network internal {
      address = "172.x.x.x/24";

      web01 [address = "172.x.x.1"];
      web02 [address = "172.x.x.2"];
      db01;
      db02;
  }
}
"""

print '/nwdiag/png/' + base64.urlsafe_b64encode(zlib.compress(nwdiag_sample, 9))

