# coding: utf-8
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

asciitosvg_sample = """
.-------------------------.
|                         |
| .---.-. .-----. .-----. |
| | .-. | +-->  | |  <--| |
| | '-' | |  <--| +-->  | |
| '---'-' '-----' '-----' |
|  ascii     2      svg   |
|                         |
'-------------------------'
"""

print '/asciitosvg/svg/' + base64.urlsafe_b64encode(zlib.compress(asciitosvg_sample, 9))

umlet_analysis = """
<?xml version="1.0" encoding="UTF-8"?><umlet_diagram><element><type>com.umlet.element.base.Relation</type><coordinates><x>390</x><y>160</y><w>90</w><h>120</h></coordinates><panel_attributes>lt=-</panel_attributes><additional_attributes>70;100;20;20</additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>390</x><y>240</y><w>90</w><h>80</h></coordinates><panel_attributes>lt=-</panel_attributes><additional_attributes>70;20;20;60</additional_attributes></element><element><type>com.umlet.element.custom.ThreeWayRelation</type><coordinates><x>460</x><y>250</y><w>30</w><h>20</h></coordinates><panel_attributes></panel_attributes><additional_attributes>transparentSelection=false</additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>470</x><y>240</y><w>90</w><h>40</h></coordinates><panel_attributes>lt=-</panel_attributes><additional_attributes>70;20;20;20</additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>360</x><y>160</y><w>40</w><h>160</h></coordinates><panel_attributes>lt=&lt;-
r1=to</panel_attributes><additional_attributes>20;140;20;20</additional_attributes></element><element><type>com.umlet.element.base.Class</type><coordinates><x>310</x><y>300</y><w>100</w><h>30</h></coordinates><panel_attributes>Airport</panel_attributes><additional_attributes>transparentSelection=false</additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>320</x><y>160</y><w>40</w><h>160</h></coordinates><panel_attributes>lt=&lt;-

r1=from</panel_attributes><additional_attributes>20;140;20;20</additional_attributes></element><element><type>com.umlet.element.base.Class</type><coordinates><x>0</x><y>300</y><w>100</w><h>30</h></coordinates><panel_attributes>MilesAccount</panel_attributes><additional_attributes>transparentSelection=false</additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>400</x><y>150</y><w>180</w><h>40</h></coordinates><panel_attributes>lt=-
m1=1
r2=fh
m2=*</panel_attributes><additional_attributes>20;20;160;20</additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>80</x><y>140</y><w>260</w><h>40</h></coordinates><panel_attributes>lt=-
r1=passagengers
m1=*
r2=flights
m2=*</panel_attributes><additional_attributes>20;20;240;20</additional_attributes></element><element><type>com.umlet.element.base.Class</type><coordinates><x>0</x><y>150</y><w>100</w><h>30</h></coordinates><panel_attributes>Passenger</panel_attributes><additional_attributes>transparentSelection=false</additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>220</x><y>20</y><w>57</w><h>160</h></coordinates><panel_attributes>lt=.
r1=booking</panel_attributes><additional_attributes>28;20;28;140</additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>350</x><y>60</y><w>184</w><h>114</h></coordinates><panel_attributes>lt=-
&lt;connectingFlights
m1=*</panel_attributes><additional_attributes>20;84;20;34;100;34;100;74;70;94</additional_attributes></element><element><type>com.umlet.element.base.Class</type><coordinates><x>560</x><y>150</y><w>110</w><h>30</h></coordinates><panel_attributes>FlightHandling</panel_attributes><additional_attributes>transparentSelection=false</additional_attributes></element><element><type>com.umlet.element.base.Class</type><coordinates><x>540</x><y>240</y><w>100</w><h>30</h></coordinates><panel_attributes>Airline</panel_attributes><additional_attributes>transparentSelection=false</additional_attributes></element><element><type>com.umlet.element.base.Class</type><coordinates><x>320</x><y>150</y><w>100</w><h>30</h></coordinates><panel_attributes>Flight</panel_attributes><additional_attributes>transparentSelection=false</additional_attributes></element><element><type>com.umlet.element.base.Class</type><coordinates><x>200</x><y>10</y><w>100</w><h>30</h></coordinates><panel_attributes>Booking</panel_attributes><additional_attributes>transparentSelection=false</additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>30</x><y>160</y><w>40</w><h>160</h></coordinates><panel_attributes>lt=&lt;-
m1=0..1
r1=mk</panel_attributes><additional_attributes>20;140;20;20</additional_attributes></element></umlet_diagram>
"""

print 'analysis'
print '/umlet/svg/' + base64.urlsafe_b64encode(zlib.compress(umlet_analysis, 9))

umlet_object = """
<?xml version="1.0" encoding="UTF-8"?><umlet_diagram><element><type>com.umlet.element.base.Class</type><coordinates><x>350</x><y>290</y><w>160</w><h>110</h></coordinates><panel_attributes>_tp2:TravelPart_
--
dep=2003-09-23
arr=2003-09-23
...</panel_attributes><additional_attributes></additional_attributes></element><element><type>com.umlet.element.base.Class</type><coordinates><x>70</x><y>290</y><w>160</w><h>110</h></coordinates><panel_attributes>_cp2: ConnPart_
--
von="LHR"
nach="LA"
flNr="NZ4550V"</panel_attributes><additional_attributes></additional_attributes></element><element><type>com.umlet.element.base.Class</type><coordinates><x>670</x><y>290</y><w>240</w><h>110</h></coordinates><panel_attributes>_tp2: TravelPart_
--
gate="A55"
...</panel_attributes><additional_attributes></additional_attributes></element><element><type>com.umlet.element.base.Class</type><coordinates><x>670</x><y>160</y><w>240</w><h>110</h></coordinates><panel_attributes>_tp1: TravelPart_
--
gate="D12"
...</panel_attributes><additional_attributes></additional_attributes></element><element><type>com.umlet.element.base.Class</type><coordinates><x>570</x><y>10</y><w>180</w><h>110</h></coordinates><panel_attributes>_th4711: TravelHandling_
--
numOfBags=2</panel_attributes><additional_attributes></additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>490</x><y>360</y><w>200</w><h>40</h></coordinates><panel_attributes>lt=&gt;-
r2=_travel_</panel_attributes><additional_attributes>180;20;20;20</additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>490</x><y>210</y><w>200</w><h>40</h></coordinates><panel_attributes>lt=&gt;-
r2=_travel_</panel_attributes><additional_attributes>180;20;20;20</additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>430</x><y>30</y><w>160</w><h>40</h></coordinates><panel_attributes>lt=&gt;-
r2=_travel_</panel_attributes><additional_attributes>140;20;20;20</additional_attributes></element><element><type>com.umlet.element.base.Class</type><coordinates><x>350</x><y>160</y><w>160</w><h>110</h></coordinates><panel_attributes>_tp1: TravelPart_
--
dep=2003-09-23
arr=2003-09-23
...</panel_attributes><additional_attributes></additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>210</x><y>360</y><w>160</w><h>40</h></coordinates><panel_attributes>lt=&gt;-
r2=_conn_</panel_attributes><additional_attributes>140;20;20;20</additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>210</x><y>220</y><w>160</w><h>40</h></coordinates><panel_attributes>lt=&gt;-
r2=_conn_</panel_attributes><additional_attributes>140;20;20;20</additional_attributes></element><element><type>com.umlet.element.base.Class</type><coordinates><x>290</x><y>10</y><w>160</w><h>110</h></coordinates><panel_attributes>_t42: Travel_
--
dep=2003-09-23
arr=2003-09-24
class="Economy"</panel_attributes><additional_attributes></additional_attributes></element><element><type>com.umlet.element.base.Class</type><coordinates><x>70</x><y>160</y><w>160</w><h>110</h></coordinates><panel_attributes>_cp1: ConnPart_
--
from="MUC"
to="LHR"
flNr="LH4754"</panel_attributes><additional_attributes></additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>150</x><y>30</y><w>160</w><h>40</h></coordinates><panel_attributes>lt=&gt;-
r2=_conn_</panel_attributes><additional_attributes>140;20;20;20</additional_attributes></element><element><type>com.umlet.element.base.Class</type><coordinates><x>10</x><y>10</y><w>160</w><h>110</h></coordinates><panel_attributes>_c42: Connection_
--
from="MUC"
to="AKL"
dep=07:45
arr=06:30 (+24)
status="planned"</panel_attributes><additional_attributes></additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>580</x><y>100</y><w>110</w><h>270</h></coordinates><panel_attributes>lt=&lt;&lt;&lt;&lt;-</panel_attributes><additional_attributes>20;20;20;250;90;250</additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>580</x><y>100</y><w>110</w><h>110</h></coordinates><panel_attributes>lt=&lt;&lt;&lt;&lt;-</panel_attributes><additional_attributes>20;20;20;90;90;90</additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>290</x><y>100</y><w>80</w><h>120</h></coordinates><panel_attributes>lt=&lt;&lt;&lt;&lt;-</panel_attributes><additional_attributes>20;20;20;100;60;100</additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>290</x><y>100</y><w>80</w><h>280</h></coordinates><panel_attributes>lt=&lt;&lt;&lt;&lt;-</panel_attributes><additional_attributes>20;20;20;260;60;260</additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>10</x><y>100</y><w>84</w><h>290</h></coordinates><panel_attributes>lt=&lt;&lt;&lt;&lt;-</panel_attributes><additional_attributes>20;20;20;270;64;270</additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>10</x><y>100</y><w>80</w><h>120</h></coordinates><panel_attributes>lt=&lt;&lt;&lt;&lt;-</panel_attributes><additional_attributes>20;20;20;100;60;100</additional_attributes></element></umlet_diagram>
"""

print 'object'
print '/umlet/svg/' + base64.urlsafe_b64encode(zlib.compress(umlet_object, 9))

umlet_struct = """
<?xml version="1.0" encoding="UTF-8"?><umlet_diagram><element><type>com.umlet.element.base.Relation</type><coordinates><x>50</x><y>340</y><w>200</w><h>160</h></coordinates><panel_attributes>lt=&lt;[GUI]</panel_attributes><additional_attributes>180;140;20;20</additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>520</x><y>360</y><w>40</w><h>100</h></coordinates><panel_attributes>lt=&lt;[=][SQL]&gt;</panel_attributes><additional_attributes>20;20;20;80</additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>580</x><y>180</y><w>130</w><h>110</h></coordinates><panel_attributes>lt=&lt;[GUI]</panel_attributes><additional_attributes>20;20;110;90</additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>50</x><y>30</y><w>190</w><h>190</h></coordinates><panel_attributes>lt=&lt;[GUI]</panel_attributes><additional_attributes>170;170;20;20</additional_attributes></element><element><type>com.umlet.element.base.Class</type><coordinates><x>220</x><y>150</y><w>380</w><h>230</h></coordinates><panel_attributes>Albatros Air Autopilot</panel_attributes><additional_attributes>transparentSelection=false</additional_attributes></element><element><type>com.umlet.element.base.Actor</type><coordinates><x>10</x><y>320</y><w>107</w><h>120</h></coordinates><panel_attributes>ground staff</panel_attributes><additional_attributes>transparentSelection=false</additional_attributes></element><element><type>com.umlet.element.base.Actor</type><coordinates><x>20</x><y>170</y><w>85</w><h>120</h></coordinates><panel_attributes>passenger</panel_attributes><additional_attributes>transparentSelection=false</additional_attributes></element><element><type>com.umlet.element.base.Actor</type><coordinates><x>10</x><y>20</y><w>105</w><h>120</h></coordinates><panel_attributes>sales partner</panel_attributes><additional_attributes>transparentSelection=false</additional_attributes></element><element><type>com.umlet.element.base.Actor</type><coordinates><x>650</x><y>240</y><w>96</w><h>120</h></coordinates><panel_attributes>bonus partner</panel_attributes><additional_attributes>transparentSelection=false</additional_attributes></element><element><type>com.umlet.element.base.Class</type><coordinates><x>230</x><y>440</y><w>380</w><h>100</h></coordinates><panel_attributes>Air Partner System</panel_attributes><additional_attributes>transparentSelection=false</additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>50</x><y>180</y><w>190</w><h>40</h></coordinates><panel_attributes>lt=&lt;[GUI]</panel_attributes><additional_attributes>170;20;20;20</additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>50</x><y>180</y><w>190</w><h>190</h></coordinates><panel_attributes>lt=&lt;[GUI]</panel_attributes><additional_attributes>170;20;110;170;20;170</additional_attributes></element><element><type>com.umlet.element.base.Actor</type><coordinates><x>620</x><y>90</y><w>151</w><h>120</h></coordinates><panel_attributes>partner airline</panel_attributes><additional_attributes>transparentSelection=false</additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>580</x><y>110</y><w>130</w><h>110</h></coordinates><panel_attributes>lt=&lt;[GUI]</panel_attributes><additional_attributes>20;90;110;20</additional_attributes></element></umlet_diagram>
"""

print 'struct'
print '/umlet/svg/' + base64.urlsafe_b64encode(zlib.compress(umlet_struct, 9))

umlet_seq = """
<?xml version="1.0" encoding="UTF-8"?><umlet_diagram><element><type>com.umlet.element.base.SequenceDiagram</type><coordinates><x>10</x><y>10</y><w>202</w><h>140</h></coordinates><panel_attributes>Client|Server
1-&gt;&gt;&gt;2:call(self,param)
2.&gt;1:number
2-&gt;1:receive(num)
</panel_attributes><additional_attributes></additional_attributes></element></umlet_diagram>
"""

print 'seq'
print '/umlet/svg/' + base64.urlsafe_b64encode(zlib.compress(umlet_seq, 9))

umlet_state = """
<?xml version="1.0" encoding="UTF-8"?>
<umlet_diagram>
    <element>
        <type>com.umlet.element.base.Relation</type>
        <coordinates>
            <x>739</x>
            <y>16</y>
            <w>232</w>
            <h>264</h>
        </coordinates>
        <panel_attributes>lt=&lt;-
when(spidersensor="rotate")
/block spider
        </panel_attributes>
        <additional_attributes>161;244;161;34;71;34;71;74</additional_attributes>
    </element>
    <element>
        <type>com.umlet.element.custom.FinalState</type>
        <coordinates>
            <x>890</x>
            <y>260</y>
            <w>20</w>
            <h>20</h>
        </coordinates>
        <panel_attributes></panel_attributes>
        <additional_attributes>transparentSelection=false</additional_attributes>
    </element>
    <element>
        <type>com.umlet.element.base.Relation</type>
        <coordinates>
            <x>750</x>
            <y>170</y>
            <w>160</w>
            <h>137</h>
        </coordinates>
        <panel_attributes>lt=&lt;-
after (10s)
/ block spider
        </panel_attributes>
        <additional_attributes>140;100;66;100;66;20</additional_attributes>
    </element>
    <element>
        <type>com.umlet.element.custom.State</type>
        <coordinates>
            <x>340</x>
            <y>420</y>
            <w>100</w>
            <h>40</h>
        </coordinates>
        <panel_attributes>wait</panel_attributes>
        <additional_attributes>transparentSelection=false</additional_attributes>
    </element>
    <element>
        <type>com.umlet.element.custom.HistoryState</type>
        <coordinates>
            <x>230</x>
            <y>440</y>
            <w>20</w>
            <h>20</h>
        </coordinates>
        <panel_attributes></panel_attributes>
        <additional_attributes>transparentSelection=false</additional_attributes>
    </element>
    <element>
        <type>com.umlet.element.base.Relation</type>
        <coordinates>
            <x>230</x>
            <y>416</y>
            <w>130</w>
            <h>54</h>
        </coordinates>
        <panel_attributes>lt=&lt;-
restart
        </panel_attributes>
        <additional_attributes>20;34;110;34</additional_attributes>
    </element>
    <element>
        <type>com.umlet.element.base.Relation</type>
        <coordinates>
            <x>270</x>
            <y>396</y>
            <w>90</w>
            <h>54</h>
        </coordinates>
        <panel_attributes>lt=&lt;-
pause
        </panel_attributes>
        <additional_attributes>70;34;20;34</additional_attributes>
    </element>
    <element>
        <type>com.umlet.element.custom.FinalState</type>
        <coordinates>
            <x>90</x>
            <y>400</y>
            <w>20</w>
            <h>20</h>
        </coordinates>
        <panel_attributes></panel_attributes>
        <additional_attributes>transparentSelection=false</additional_attributes>
    </element>
    <element>
        <type>com.umlet.element.base.Relation</type>
        <coordinates>
            <x>46</x>
            <y>256</y>
            <w>114</w>
            <h>164</h>
        </coordinates>
        <panel_attributes>lt=&lt;-
after (10s)
/timeout
        </panel_attributes>
        <additional_attributes>54;144;54;34;94;34</additional_attributes>
    </element>
    <element>
        <type>com.umlet.element.base.Relation</type>
        <coordinates>
            <x>230</x>
            <y>110</y>
            <w>190</w>
            <h>170</h>
        </coordinates>
        <panel_attributes>lt=&lt;-
timeout
        </panel_attributes>
        <additional_attributes>20;150;110;150;110;20;170;20</additional_attributes>
    </element>
    <element>
        <type>com.umlet.element.custom.State</type>
        <coordinates>
            <x>700</x>
            <y>90</y>
            <w>180</w>
            <h>100</h>
        </coordinates>
        <panel_attributes>accept
boarding pass
--
entry/ release card
do/release spider
        </panel_attributes>
        <additional_attributes>transparentSelection=true</additional_attributes>
    </element>
    <element>
        <type>com.umlet.element.base.Relation</type>
        <coordinates>
            <x>540</x>
            <y>140</y>
            <w>205</w>
            <h>100</h>
        </coordinates>
        <panel_attributes>lt=&lt;-
[passenger booked]
        </panel_attributes>
        <additional_attributes>160;20;120;80;20;80</additional_attributes>
    </element>
    <element>
        <type>com.umlet.element.base.Relation</type>
        <coordinates>
            <x>450</x>
            <y>210</y>
            <w>239</w>
            <h>190</h>
        </coordinates>
        <panel_attributes>lt=&lt;-
[passenger not booked]
        </panel_attributes>
        <additional_attributes>219;170;99;170;99;20</additional_attributes>
    </element>
    <element>
        <type>com.umlet.element.custom.State</type>
        <coordinates>
            <x>670</x>
            <y>350</y>
            <w>120</w>
            <h>50</h>
        </coordinates>
        <panel_attributes>reject
boarding pass
        </panel_attributes>
        <additional_attributes>transparentSelection=false</additional_attributes>
    </element>
    <element>
        <type>com.umlet.element.base.Relation</type>
        <coordinates>
            <x>480</x>
            <y>130</y>
            <w>142</w>
            <h>100</h>
        </coordinates>
        <panel_attributes>lt=&lt;-
result of search
        </panel_attributes>
        <additional_attributes>71;80;71;20</additional_attributes>
    </element>
    <element>
        <type>com.umlet.element.base.Relation</type>
        <coordinates>
            <x>270</x>
            <y>70</y>
            <w>150</w>
            <h>40</h>
        </coordinates>
        <panel_attributes>lt=&lt;-</panel_attributes>
        <additional_attributes>130;20;20;20</additional_attributes>
    </element>
    <element>
        <type>com.umlet.element.custom.ThreeWayRelation</type>
        <coordinates>
            <x>540</x>
            <y>210</y>
            <w>20</w>
            <h>20</h>
        </coordinates>
        <panel_attributes></panel_attributes>
        <additional_attributes>transparentSelection=false</additional_attributes>
    </element>
    <element>
        <type>com.umlet.element.custom.State</type>
        <coordinates>
            <x>140</x>
            <y>60</y>
            <w>150</w>
            <h>420</h>
        </coordinates>
        <panel_attributes>read boarding pass
--
        </panel_attributes>
        <additional_attributes>transparentSelection=true</additional_attributes>
    </element>
    <element>
        <type>com.umlet.element.custom.State</type>
        <coordinates>
            <x>400</x>
            <y>60</y>
            <w>180</w>
            <h>90</h>
        </coordinates>
        <panel_attributes>check passenger
--
entry/start search
do/blink lamp
        </panel_attributes>
        <additional_attributes>transparentSelection=true</additional_attributes>
    </element>
    <element>
        <type>com.umlet.element.custom.FinalState</type>
        <coordinates>
            <x>170</x>
            <y>410</y>
            <w>20</w>
            <h>20</h>
        </coordinates>
        <panel_attributes></panel_attributes>
        <additional_attributes>transparentSelection=false</additional_attributes>
    </element>
    <element>
        <type>com.umlet.element.custom.State</type>
        <coordinates>
            <x>150</x>
            <y>240</y>
            <w>100</w>
            <h>40</h>
        </coordinates>
        <panel_attributes>read
passenger ID
        </panel_attributes>
        <additional_attributes>transparentSelection=false</additional_attributes>
    </element>
    <element>
        <type>com.umlet.element.custom.State</type>
        <coordinates>
            <x>150</x>
            <y>330</y>
            <w>100</w>
            <h>40</h>
        </coordinates>
        <panel_attributes>identify
passenger
        </panel_attributes>
        <additional_attributes>transparentSelection=false</additional_attributes>
    </element>
    <element>
        <type>com.umlet.element.base.Relation</type>
        <coordinates>
            <x>160</x>
            <y>260</y>
            <w>40</w>
            <h>90</h>
        </coordinates>
        <panel_attributes>lt=&lt;-</panel_attributes>
        <additional_attributes>20;70;20;20</additional_attributes>
    </element>
    <element>
        <type>com.umlet.element.base.Relation</type>
        <coordinates>
            <x>160</x>
            <y>100</y>
            <w>40</w>
            <h>70</h>
        </coordinates>
        <panel_attributes>lt=&lt;-</panel_attributes>
        <additional_attributes>20;50;20;20</additional_attributes>
    </element>
    <element>
        <type>com.umlet.element.base.Relation</type>
        <coordinates>
            <x>160</x>
            <y>350</y>
            <w>40</w>
            <h>80</h>
        </coordinates>
        <panel_attributes>lt=&lt;-</panel_attributes>
        <additional_attributes>20;60;20;20</additional_attributes>
    </element>
    <element>
        <type>com.umlet.element.base.Relation</type>
        <coordinates>
            <x>140</x>
            <y>170</y>
            <w>78</w>
            <h>90</h>
        </coordinates>
        <panel_attributes>lt=&lt;-
[valid]
        </panel_attributes>
        <additional_attributes>39;70;39;20</additional_attributes>
    </element>
    <element>
        <type>com.umlet.element.custom.State</type>
        <coordinates>
            <x>150</x>
            <y>150</y>
            <w>100</w>
            <h>40</h>
        </coordinates>
        <panel_attributes>check
validity
        </panel_attributes>
        <additional_attributes>transparentSelection=false</additional_attributes>
    </element>
    <element>
        <type>com.umlet.element.custom.InitialState</type>
        <coordinates>
            <x>170</x>
            <y>100</y>
            <w>20</w>
            <h>20</h>
        </coordinates>
        <panel_attributes></panel_attributes>
        <additional_attributes>transparentSelection=false</additional_attributes>
    </element>
</umlet_diagram>
"""

print 'state'
print '/umlet/svg/' + base64.urlsafe_b64encode(zlib.compress(umlet_state, 9))


print ''
print 'Graphviz'

graphviz_clusters = """
digraph G {

  subgraph cluster_0 {
    style=filled;
    color=lightgrey;
    node [style=filled,color=white];
    a0 -> a1 -> a2 -> a3;
    label = "process #1";
  }

  subgraph cluster_1 {
    node [style=filled];
    b0 -> b1 -> b2 -> b3;
    label = "process #2";
    color=blue
  }
  start -> a0;
  start -> b0;
  a1 -> b3;
  b2 -> a3;
  a3 -> a0;
  a3 -> end;
  b3 -> end;

  start [shape=Mdiamond];
  end [shape=Msquare];
}
"""

print 'cluster'
print '/graphviz/svg/' + base64.urlsafe_b64encode(zlib.compress(graphviz_clusters, 9))

graphviz_unix = """
digraph "unix" {
  graph [  fontname = "Helvetica-Oblique",
    fontsize = 36,
    label = "\n\n\n\nObject Oriented Graphs\nStephen North, 3/19/93",
    size = "6,6" ];
  node [  shape = polygon,
    sides = 4,
    distortion = "0.0",
    orientation = "0.0",
    skew = "0.0",
    color = white,
    style = filled,
    fontname = "Helvetica-Outline" ];
  "5th Edition" [sides=9, distortion="0.936354", orientation=28, skew="-0.126818", color=salmon2];
  "6th Edition" [sides=5, distortion="0.238792", orientation=11, skew="0.995935", color=deepskyblue];
  "PWB 1.0" [sides=8, distortion="0.019636", orientation=79, skew="-0.440424", color=goldenrod2];
  LSX [sides=9, distortion="-0.698271", orientation=22, skew="-0.195492", color=burlywood2];
  "1 BSD" [sides=7, distortion="0.265084", orientation=26, skew="0.403659", color=gold1];
  "Mini Unix" [distortion="0.039386", orientation=2, skew="-0.461120", color=greenyellow];
  Wollongong [sides=5, distortion="0.228564", orientation=63, skew="-0.062846", color=darkseagreen];
  Interdata [distortion="0.624013", orientation=56, skew="0.101396", color=dodgerblue1];
  "Unix/TS 3.0" [sides=8, distortion="0.731383", orientation=43, skew="-0.824612", color=thistle2];
  "PWB 2.0" [sides=6, distortion="0.592100", orientation=34, skew="-0.719269", color=darkolivegreen3];
  "7th Edition" [sides=10, distortion="0.298417", orientation=65, skew="0.310367", color=chocolate];
  "8th Edition" [distortion="-0.997093", orientation=50, skew="-0.061117", color=turquoise3];
  "32V" [sides=7, distortion="0.878516", orientation=19, skew="0.592905", color=steelblue3];
  V7M [sides=10, distortion="-0.960249", orientation=32, skew="0.460424", color=navy];
  "Ultrix-11" [sides=10, distortion="-0.633186", orientation=10, skew="0.333125", color=darkseagreen4];
  Xenix [sides=8, distortion="-0.337997", orientation=52, skew="-0.760726", color=coral];
  "UniPlus+" [sides=7, distortion="0.788483", orientation=39, skew="-0.526284", color=darkolivegreen3];
  "9th Edition" [sides=7, distortion="0.138690", orientation=55, skew="0.554049", color=coral3];
  "2 BSD" [sides=7, distortion="-0.010661", orientation=84, skew="0.179249", color=blanchedalmond];
  "2.8 BSD" [distortion="-0.239422", orientation=44, skew="0.053841", color=lightskyblue1];
  "2.9 BSD" [distortion="-0.843381", orientation=70, skew="-0.601395", color=aquamarine2];
  "3 BSD" [sides=10, distortion="0.251820", orientation=18, skew="-0.530618", color=lemonchiffon];
  "4 BSD" [sides=5, distortion="-0.772300", orientation=24, skew="-0.028475", color=darkorange1];
  "4.1 BSD" [distortion="-0.226170", orientation=38, skew="0.504053", color=lightyellow1];
  "4.2 BSD" [sides=10, distortion="-0.807349", orientation=50, skew="-0.908842", color=darkorchid4];
  "4.3 BSD" [sides=10, distortion="-0.030619", orientation=76, skew="0.985021", color=lemonchiffon2];
  "Ultrix-32" [distortion="-0.644209", orientation=21, skew="0.307836", color=goldenrod3];
  "PWB 1.2" [sides=7, distortion="0.640971", orientation=84, skew="-0.768455", color=cyan];
  "USG 1.0" [distortion="0.758942", orientation=42, skew="0.039886", color=blue];
  "CB Unix 1" [sides=9, distortion="-0.348692", orientation=42, skew="0.767058", color=firebrick];
  "USG 2.0" [distortion="0.748625", orientation=74, skew="-0.647656", color=chartreuse4];
  "CB Unix 2" [sides=10, distortion="0.851818", orientation=32, skew="-0.020120", color=greenyellow];
  "CB Unix 3" [sides=10, distortion="0.992237", orientation=29, skew="0.256102", color=bisque4];
  "Unix/TS++" [sides=6, distortion="0.545461", orientation=16, skew="0.313589", color=mistyrose2];
  "PDP-11 Sys V" [sides=9, distortion="-0.267769", orientation=40, skew="0.271226", color=cadetblue1];
  "USG 3.0" [distortion="-0.848455", orientation=44, skew="0.267152", color=bisque2];
  "Unix/TS 1.0" [distortion="0.305594", orientation=75, skew="0.070516", color=orangered];
  "TS 4.0" [sides=10, distortion="-0.641701", orientation=50, skew="-0.952502", color=crimson];
  "System V.0" [sides=9, distortion="0.021556", orientation=26, skew="-0.729938", color=darkorange1];
  "System V.2" [sides=6, distortion="0.985153", orientation=33, skew="-0.399752", color=darkolivegreen4];
  "System V.3" [sides=7, distortion="-0.687574", orientation=58, skew="-0.180116", color=lightsteelblue1];
  "5th Edition" -> "6th Edition";
  "5th Edition" -> "PWB 1.0";
  "6th Edition" -> LSX;
  "6th Edition" -> "1 BSD";
  "6th Edition" -> "Mini Unix";
  "6th Edition" -> Wollongong;
  "6th Edition" -> Interdata;
  Interdata -> "Unix/TS 3.0";
  Interdata -> "PWB 2.0";
  Interdata -> "7th Edition";
  "7th Edition" -> "8th Edition";
  "7th Edition" -> "32V";
  "7th Edition" -> V7M;
  "7th Edition" -> "Ultrix-11";
  "7th Edition" -> Xenix;
  "7th Edition" -> "UniPlus+";
  V7M -> "Ultrix-11";
  "8th Edition" -> "9th Edition";
  "1 BSD" -> "2 BSD";
  "2 BSD" -> "2.8 BSD";
  "2.8 BSD" -> "Ultrix-11";
  "2.8 BSD" -> "2.9 BSD";
  "32V" -> "3 BSD";
  "3 BSD" -> "4 BSD";
  "4 BSD" -> "4.1 BSD";
  "4.1 BSD" -> "4.2 BSD";
  "4.1 BSD" -> "2.8 BSD";
  "4.1 BSD" -> "8th Edition";
  "4.2 BSD" -> "4.3 BSD";
  "4.2 BSD" -> "Ultrix-32";
  "PWB 1.0" -> "PWB 1.2";
  "PWB 1.0" -> "USG 1.0";
  "PWB 1.2" -> "PWB 2.0";
  "USG 1.0" -> "CB Unix 1";
  "USG 1.0" -> "USG 2.0";
  "CB Unix 1" -> "CB Unix 2";
  "CB Unix 2" -> "CB Unix 3";
  "CB Unix 3" -> "Unix/TS++";
  "CB Unix 3" -> "PDP-11 Sys V";
  "USG 2.0" -> "USG 3.0";
  "USG 3.0" -> "Unix/TS 3.0";
  "PWB 2.0" -> "Unix/TS 3.0";
  "Unix/TS 1.0" -> "Unix/TS 3.0";
  "Unix/TS 3.0" -> "TS 4.0";
  "Unix/TS++" -> "TS 4.0";
  "CB Unix 3" -> "TS 4.0";
  "TS 4.0" -> "System V.0";
  "System V.0" -> "System V.2";
  "System V.2" -> "System V.3";
}
"""

print 'unix'
print '/graphviz/svg/' + base64.urlsafe_b64encode(zlib.compress(graphviz_unix, 9))


graphviz_hello = """digraph G {Hello->World}"""

print 'hello'
print '/graphviz/svg/' + base64.urlsafe_b64encode(zlib.compress(graphviz_hello, 9))




erd_person = """
[Person]
*name
height
weight
+birth_location_id

[Location]
*id
city
state
country

Person *--1 Location
"""

print 'erd'
print '/erd/svg/' + base64.urlsafe_b64encode(zlib.compress(erd_person, 9))

svgbob = """
                          .-,(  ),-.
           ___  _      .-(          )-.
          [___]|=| -->(                )      __________
          /::/ |_|     '-(          ).-' --->[_...__...°]
                          '-.( ).-'
                                  \      ____   __
                                   '--->|    | |==|
                                        |____| |  |
                                        /::::/ |__|
"""

print 'svgbob'
print '/svgbob/svg/' + base64.urlsafe_b64encode(zlib.compress(svgbob, 9))

ditaa = """
                          +-------------+
                          |             |
                          | Exponential |
                          |             |
                          +-------------+
                                 |
                          lambda |                                                          
                                 v
+-------------+           +-------------+           +-------------+
|             |   tau     |             |   lambda  |             |
|  Lognormal  |---------->|    Gamma    |<----------| Poisson     |
|             |           |             |---+       |             |
+-------------+           +-------------+   |       +-------------+
      |                         ^ ^         | beta
      |                   tau   | |         | 
      | tau                     | +---------+
      |                   +-------------+ 
      +------------------>|             |
                          |     Normal  |
                          |             |----+
                          +-------------+    | 
                                     ^       | mu
                                     |       |
                                     +-------+
"""

print 'ditaa'
print '/ditaa/svg/' + base64.urlsafe_b64encode(zlib.compress(ditaa, 9))


umlet_state_simple = """
<?xml version="1.0" encoding="UTF-8"?><umlet_diagram><element><type>com.umlet.element.base.Relation</type><coordinates><x>431</x><y>90</y><w>258</w><h>110</h></coordinates><panel_attributes>lt=&lt;
handle()
passenger.addMiles(flight.miles)</panel_attributes><additional_attributes>129;90;129;20</additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>294</x><y>6</y><w>232</w><h>94</h></coordinates><panel_attributes>lt=&lt;-
transfer [Class &lt;&gt; Economy]</panel_attributes><additional_attributes>96;74;116;74;116;34;66;34;66;64</additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>280</x><y>90</y><w>297</w><h>110</h></coordinates><panel_attributes>lt=&lt;-
r2=cancel()</panel_attributes><additional_attributes>277;90;27;90;27;20</additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>70</x><y>90</y><w>507</w><h>110</h></coordinates><panel_attributes>lt=&lt;-
r2=cancel()</panel_attributes><additional_attributes>487;90;27;90;27;20</additional_attributes></element><element><type>com.umlet.element.custom.State</type><coordinates><x>80</x><y>70</y><w>100</w><h>40</h></coordinates><panel_attributes>reserved</panel_attributes><additional_attributes>transparentSelection=false</additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>160</x><y>60</y><w>150</w><h>54</h></coordinates><panel_attributes>lt=&lt;-
pay()</panel_attributes><additional_attributes>130;34;20;34</additional_attributes></element><element><type>com.umlet.element.custom.SeqDestroyMark</type><coordinates><x>550</x><y>170</y><w>20</w><h>20</h></coordinates><panel_attributes></panel_attributes><additional_attributes>transparentSelection=false</additional_attributes></element><element><type>com.umlet.element.custom.State</type><coordinates><x>290</x><y>70</y><w>100</w><h>40</h></coordinates><panel_attributes>booked</panel_attributes><additional_attributes>transparentSelection=false</additional_attributes></element><element><type>com.umlet.element.base.Relation</type><coordinates><x>370</x><y>60</y><w>150</w><h>54</h></coordinates><panel_attributes>lt=&lt;-
start()</panel_attributes><additional_attributes>130;34;20;34</additional_attributes></element><element><type>com.umlet.element.custom.State</type><coordinates><x>500</x><y>70</y><w>100</w><h>40</h></coordinates><panel_attributes>started</panel_attributes><additional_attributes>transparentSelection=false</additional_attributes></element></umlet_diagram>"""

print 'umlet_state_simple'
print '/umlet/svg/' + base64.urlsafe_b64encode(zlib.compress(umlet_state_simple, 9))


plantuml = """
@startuml
left to right direction
skinparam packageStyle rectangle
skinparam monochrome true
actor customer
actor clerk
rectangle checkout {
  customer -- (checkout)
  (checkout) .> (payment) : include
  (help) .> (checkout) : extends
  (checkout) -- clerk
}
@enduml
"""

print 'plantuml_use_case'
print '/plantuml/svg/' + base64.urlsafe_b64encode(zlib.compress(plantuml, 9))

print 'c4'

context_bigbank = """
@startuml
!include C4_Context.puml

LAYOUT_WITH_LEGEND

title System Context diagram for Internet Banking System

Person(customer, "Personal Banking Customer", "A customer of the bank, with personal bank accounts.")
System(banking_system, "Internet Banking System", "Allows customers to view information about their bank accounts, and make payments.")

System_Ext(mail_system, "E-mail system", "The internal Microsoft Exchange e-mail system.")
System_Ext(mainframe, "Mainframe Banking System", "Stores all of the core banking information about customers, accounts, transactions, etc.")

Rel(customer, banking_system, "Uses")
Rel_Back(customer, mail_system, "Sends e-mails to")
Rel_Neighbor(banking_system, mail_system, "Sends e-mails", "SMTP")
Rel(banking_system, mainframe, "Uses")
@enduml
"""

print 'context'
print '/c4plantuml/svg/' + base64.urlsafe_b64encode(zlib.compress(context_bigbank, 9))

container_bigbank = """
@startuml
!includeurl https://raw.githubusercontent.com/RicardoNiepel/C4-PlantUML/master/C4_Container.puml

LAYOUT_TOP_DOWN
'LAYOUT_AS_SKETCH
LAYOUT_WITH_LEGEND

title Container diagram for Internet Banking System

Person(customer, Customer, "A customer of the bank, with personal bank accounts")

System_Boundary(c1, "Internet Banking") {
    Container(web_app, "Web Application", "Java, Spring MVC", "Delivers the static content and the Internet banking SPA")
    Container(spa, "Single-Page App", "JavaScript, Angular", "Provides all the Internet banking functionality to cutomers via their web browser")
    Container(mobile_app, "Mobile App", "C#, Xamarin", "Provides a limited subset of the Internet banking functionality to customers via their mobile device")
    ContainerDb(database, "Database", "SQL Database", "Stores user registraion information, hased auth credentials, access logs, etc.")
    Container(backend_api, "API Application", "Java, Docker Container", "Provides Internet banking functionality via API")
}

System_Ext(email_system, "E-Mail System", "The internal Microsoft Exchange system")
System_Ext(banking_system, "Mainframe Banking System", "Stores all of the core banking information about customers, accounts, transactions, etc.")

Rel(customer, web_app, "Uses", "HTTPS")
Rel(customer, spa, "Uses", "HTTPS")
Rel(customer, mobile_app, "Uses")

Rel_Neighbor(web_app, spa, "Delivers")
Rel(spa, backend_api, "Uses", "async, JSON/HTTPS")
Rel(mobile_app, backend_api, "Uses", "async, JSON/HTTPS")
Rel_Back_Neighbor(database, backend_api, "Reads from and writes to", "sync, JDBC")

Rel_Back(customer, email_system, "Sends e-mails to")
Rel_Back(email_system, backend_api, "Sends e-mails using", "sync, SMTP")
Rel_Neighbor(backend_api, banking_system, "Uses", "sync/async, XML/HTTPS")
@enduml
"""

print 'container'
print '/c4plantuml/svg/' + base64.urlsafe_b64encode(zlib.compress(container_bigbank, 9))


comp_bigbank = """
@startuml
!include c4_component.puml

LAYOUT_WITH_LEGEND

title Component diagram for Internet Banking System - API Application

Container(spa, "Single Page Application", "javascript and angular", "Provides all the internet banking functionality to customers via their web browser.")
Container(ma, "Mobile App", "Xamarin", "Provides a limited subset ot the internet banking functionality to customers via their mobile mobile device.")
ContainerDb(db, "Database", "Relational Database Schema", "Stores user registration information, hashed authentication credentials, access logs, etc.")
System_Ext(mbs, "Mainframe Banking System", "Stores all of the core banking information about customers, accounts, transactions, etc.")

Container_Boundary(api, "API Application") {
    Component(sign, "Sign In Controller", "MVC Rest Controlle", "Allows users to sign in to the internet banking system")
    Component(accounts, "Accounts Summary Controller", "MVC Rest Controlle", "Provides customers with a summory of their bank accounts")
    Component(security, "Security Component", "Spring Bean", "Provides functionality related to singing in, changing passwords, etc.")
    Component(mbsfacade, "Mainframe Banking System Facade", "Spring Bean", "A facade onto the mainframe banking system.")

    Rel(sign, security, "Uses")
    Rel(accounts, mbsfacade, "Uses")
    Rel(security, db, "Read & write to", "JDBC")
    Rel(mbsfacade, mbs, "Uses", "XML/HTTPS")
}

Rel(spa, sign, "Uses", "JSON/HTTPS")
Rel(spa, accounts, "Uses", "JSON/HTTPS")

Rel(ma, sign, "Uses", "JSON/HTTPS")
Rel(ma, accounts, "Uses", "JSON/HTTPS")
@enduml
"""

print 'component'
print '/c4plantuml/svg/' + base64.urlsafe_b64encode(zlib.compress(comp_bigbank, 9))

