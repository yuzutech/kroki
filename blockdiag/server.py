import io
import base64
import zlib
from flask import Flask, send_file, Response, make_response, jsonify
from blockdiag.utils.bootstrap import create_fontmap
from blockdiag.command import BlockdiagApp
from blockdiag.parser import ParseException
from seqdiag.command import SeqdiagApp
from nwdiag.command import NwdiagApp
from actdiag.command import ActdiagApp

application = Flask(__name__)


class InvalidUsage(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv


class GenerateError(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv


def _generate_diagram(app, diagram_type, output_format, source_encoded):
    options = ['-T' + output_format, 'file']
    app.parse_options(options)

    if output_format and output_format.lower() == 'pdf':
        app.options.font = [
            '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf',
            '/usr/share/fonts/ttf-dejavu/DejaVuSerif.ttf'
        ]

    app.fontmap = create_fontmap(app.options)
    app.setup()

    source = zlib.decompress(base64.urlsafe_b64decode(source_encoded.encode('ascii')))
    app.code = source

    try:
        tree = app.module.parser.parse_string(app.code)
        diagram = app.module.builder.ScreenNodeBuilder.build(tree, app.options)
        drawer = app.module.drawer.DiagramDraw(app.options.type, diagram,
                                               None,
                                               fontmap=app.fontmap,
                                               code=app.code,
                                               antialias=app.options.antialias,
                                               nodoctype=app.options.nodoctype,
                                               transparency=app.options.transparency)
        drawer.draw()
        drawer.drawer._run()
        if app.options.type == 'PNG':
            bin_text = drawer.drawer.save(None, None, drawer.format)
            return send_file(io.BytesIO(bin_text),
                             attachment_filename='result.png',
                             mimetype='image/png')
        elif app.options.type == 'PDF':
            pdf_drawer = drawer.drawer.target
            pdf_drawer.canvas.showPage()
            binary_pdf = pdf_drawer.canvas.getpdfdata()
            response = make_response(binary_pdf)
            response.headers['Content-Type'] = 'application/pdf'
            response.headers['Content-Disposition'] = 'inline; filename=%s.pdf' % 'result'
            return response
        elif app.options.type == 'SVG':
            xml_text = drawer.drawer.save(None, None, drawer.format)
            response = Response(xml_text, mimetype='image/svg+xml')
            response.headers["Content-Type"] = "image/svg+xml; charset=utf-8"
            return response
    except (ParseException, RuntimeError):
        raise GenerateError('Unable to generate the ' + diagram_type + ' diagram from source',
                            status_code=500,
                            payload={
                                'source': source,
                                'output_format': output_format,
                                'diagram_type': diagram_type
                            })


@application.route('/blockdiag/<string:output_format>/<string:source_encoded>')
def blockdiag(output_format, source_encoded):
    return _generate_diagram(BlockdiagApp(), 'block', output_format, source_encoded)


@application.route('/seqdiag/<string:output_format>/<string:source_encoded>')
def seqdiag(output_format, source_encoded):
    return _generate_diagram(SeqdiagApp(), 'sequence', output_format, source_encoded)


@application.route('/actdiag/<string:output_format>/<string:source_encoded>')
def actdiag(output_format, source_encoded):
    return _generate_diagram(ActdiagApp(), 'activity', output_format, source_encoded)


@application.route('/nwdiag/<string:output_format>/<string:source_encoded>')
def nwdiag(output_format, source_encoded):
    return _generate_diagram(NwdiagApp(), 'network', output_format, source_encoded)


@application.route('/<string:output_format>/<string:source_encoded>')
def diag(output_format, source_encoded):
    source = zlib.decompress(base64.urlsafe_b64decode(source_encoded.encode('ascii'))).lstrip()
    if source.startswith('blockdiag'):
        return blockdiag(output_format, source_encoded)
    elif source.startswith('seqdiag'):
        return seqdiag(output_format, source_encoded)
    elif source.startswith('actdiag'):
        return actdiag(output_format, source_encoded)
    elif source.startswith('nwdiag'):
        return nwdiag(output_format, source_encoded)
    else:
        raise InvalidUsage('Diagram source must begin with one of the following: blockdiag, seqdiag, actdiag or nwdiag',
                           status_code=400)


@application.errorhandler(GenerateError)
def handle_generate_error(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response


@application.errorhandler(InvalidUsage)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response


if __name__ == '__main__':
    application.run(debug=True, host='0.0.0.0')
