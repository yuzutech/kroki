import unittest
import sys

from rackdiag.command import RackdiagApp
from packetdiag.command import PacketdiagApp
from blockdiag.command import BlockdiagApp
from seqdiag.command import SeqdiagApp
from nwdiag.command import NwdiagApp
from actdiag.command import ActdiagApp
from werkzeug.datastructures import MultiDict

sys.path.append('src')
from backend.diag import generate_diag
from server import InvalidUsage


class TestDiag(unittest.TestCase):

    def _generate(self, filename, diagram_type=None, options=None):
        if options is None:
            options = MultiDict()
        with open('test/fixtures/' + filename + '_source.txt', 'r') as file:
            source = file.read()
        with open('test/fixtures/' + filename + '_expected.svg', 'r') as file:
            lines = file.readlines()
            expected = '\n'.join([item.strip() for item in lines])

        if diagram_type is None:
            diagram_type = filename

        if diagram_type == 'nwdiag':
            app, name = NwdiagApp(), 'network'
        elif diagram_type == 'blockdiag':
            app, name = BlockdiagApp(), 'block'
        elif diagram_type == 'seqdiag':
            app, name = SeqdiagApp(), 'sequence'
        elif diagram_type == 'actdiag':
            app, name = ActdiagApp(), 'activity'
        elif diagram_type == 'packetdiag':
            app, name = PacketdiagApp(), 'packet'
        elif diagram_type == 'rackdiag':
            app, name = RackdiagApp(), 'rack'
        else:
            raise InvalidUsage('Unknown diagram type: ' + diagram_type)
        result = generate_diag(app, name, 'svg', source, options)
        actual = '\n'.join([item.strip() for item in result.split('\n')])
        return actual, expected

    def test_nwdiag(self):
        actual, expected = self._generate('nwdiag')
        self.maxDiff = None
        self.assertEqual(actual, expected)

    def test_blockdiag(self):
        actual, expected = self._generate('blockdiag')
        self.maxDiff = None
        self.assertEqual(actual, expected)

    def test_seqdiag(self):
        actual, expected = self._generate('seqdiag')
        self.maxDiff = None
        self.assertEqual(actual, expected)

    def test_seqdiag_issue_134(self):
        actual, expected = self._generate('seqdiag_issue_134', 'seqdiag')
        self.maxDiff = None
        self.assertEqual(actual, expected)

    def test_actdiag(self):
        actual, expected = self._generate('actdiag')
        self.maxDiff = None
        self.assertEqual(actual, expected)

    def test_packetdiag(self):
        actual, expected = self._generate('packetdiag')
        self.maxDiff = None
        self.assertEqual(actual, expected)

    def test_rackdiag(self):
        actual, expected = self._generate('rackdiag')
        self.maxDiff = None
        self.assertEqual(actual, expected)

    def test_blockdiag_with_options(self):
        actual, expected = self._generate('blockdiag_options', 'blockdiag', options=MultiDict([
            ('no-doctype', '')
        ]))
        self.maxDiff = None
        self.assertEqual(actual, expected)

    def test_blockdiag_utf8(self):
        actual, expected = self._generate('blockdiag_utf8', 'blockdiag')
        self.maxDiff = None
        self.assertEqual(actual, expected)

if __name__ == '__main__':
    unittest.main()
