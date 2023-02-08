# coding: utf-8
import base64
import zlib


def encode(source):
    return base64.urlsafe_b64encode(zlib.compress(source.encode('utf-8'), 9)).decode('utf-8')


def section(title):
    print('')
    print('')
    print('== ' + title)


def sample(service, source):
    print('\n```' + source + '```')
    print('/' + service + '/svg/' + encode(source))


print('= Examples')

section('WireViz')
cable = """
connectors:
  X1:
    type: D-Sub
    subtype: female
    pinlabels: [DCD, RX, TX, DTR, GND, DSR, RTS, CTS, RI]
  X2:
    type: Molex KK 254
    subtype: female
    pinlabels: [GND, RX, TX]

cables:
  W1:
    gauge: 0.25 mm2
    length: 0.2
    color_code: DIN
    wirecount: 3
    shield: true

connections:
  -
    - X1: [5,2,3]
    - W1: [1,2,3]
    - X2: [1,3,2]
  -
    - X1: 5
    - W1: s
"""
sample('wireviz', cable)
