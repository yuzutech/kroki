import unittest
import sys

from werkzeug.datastructures import MultiDict

sys.path.append('src')
from server import InvalidUsage
from server import

class TestDiag(unittest.TestCase):

    def _generate(self, filename, options=None):
        if options is None:
            options = MultiDict()
        with open('test/fixtures/' + filename + '_source.txt', 'r') as file:
            source = file.read()
        with open('test/fixtures/' + filename + '_expected.svg', 'r') as file:
            lines = file.readlines()
            expected = '\n'.join([item.strip() for item in lines])

        result = parse(yaml_input=source, return_types='svg')
        actual = '\n'.join([item.strip() for item in result.split('\n')])
        return actual, expected

    def test_wireviz(self):
        actual, expected = self._generate('wireviz')
        self.maxDiff = None
        self.assertEqual(actual, expected)

if __name__ == '__main__':
    unittest.main()
