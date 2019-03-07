import io
from flask import Flask, send_file, make_response, jsonify
from blockdiag.command import BlockdiagApp
from seqdiag.command import SeqdiagApp
from nwdiag.command import NwdiagApp
from actdiag.command import ActdiagApp
from backend.diag import generate_diag
from backend.error import GenerateError
from flask import request
from blockdiag import __version__ as blockdiag_version
from actdiag import __version__ as actdiag_version
from nwdiag import __version__ as nwdiag_version
from seqdiag import __version__ as seqdiag_version
from werkzeug.exceptions import default_exceptions
from werkzeug.exceptions import HTTPException


def make_json_app(import_name, **kwargs):
    """
    Creates a JSON-oriented Flask app.
    All error responses that you don't specifically
    manage yourself will have application/json content
    type, and will contain JSON like this (just an example):
    { "message": "405: Method Not Allowed" }
    """
    def make_json_error(ex):
        response = jsonify({"error": str(ex.description)})
        response.status_code = (ex.code
                                if isinstance(ex, HTTPException)
                                else 500)
        return response

    app = Flask(import_name, **kwargs)

    for code in iter(default_exceptions.keys()):
        app.errorhandler(code)(make_json_error)

    return app


application = make_json_app(__name__)


class InvalidUsage(Exception):
    status_code = 400

    def __init__(self, error, status_code=None, payload=None):
        Exception.__init__(self)
        self.error = error
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['error'] = self.error
        return rv


def _generate_diagram(app, diagram_type, output_format, source):
    try:
        output_format = output_format.lower()
        if output_format == 'png':
            result = generate_diag(app, diagram_type, output_format, source)
            response = send_file(io.BytesIO(result),
                                 attachment_filename='result.png',
                                 mimetype='image/png')
            return response
        elif output_format == 'pdf':
            result = generate_diag(app, diagram_type, output_format, source)
            response = make_response(result)
            response.headers['Content-Type'] = 'application/pdf'
            response.headers['Content-Disposition'] = 'inline; filename=result.pdf'
            return response
        elif output_format == 'svg':
            result = generate_diag(app, diagram_type, output_format, source)
            response = make_response(result)
            response.headers["Content-Type"] = "image/svg+xml; charset=utf-8"
            return response
        else:
            raise InvalidUsage('Unsupported output format: %s. Must be one of: png, svg or pdf.' % output_format,
                               status_code=400)
    except GenerateError as err:
        raise err
    except Exception as err:
        raise GenerateError('Unexpected error',
                            status_code=500,
                            payload={
                                'source': source,
                                'output_format': output_format,
                                'diagram_type': diagram_type,
                                'error': str(err)
                            })


@application.route('/_status', methods=['GET'])
def status():
    return jsonify(
        name='blockdiag',
        version={
            'blockdiag': blockdiag_version,
            'actdiag': actdiag_version,
            'nwdiag': nwdiag_version,
            'seqdiag': seqdiag_version
        }
    )


@application.route('/blockdiag/<string:output_format>', methods=['POST'])
def blockdiag(output_format, source=None):
    return _generate_diagram(BlockdiagApp(), 'block', output_format, source or request.get_data(as_text=True))


@application.route('/seqdiag/<string:output_format>', methods=['POST'])
def seqdiag(output_format, source=None):
    return _generate_diagram(SeqdiagApp(), 'sequence', output_format, source or request.get_data(as_text=True))


@application.route('/actdiag/<string:output_format>', methods=['POST'])
def actdiag(output_format, source=None):
    return _generate_diagram(ActdiagApp(), 'activity', output_format, source or request.get_data(as_text=True))


@application.route('/nwdiag/<string:output_format>', methods=['POST'])
def nwdiag(output_format, source=None):
    return _generate_diagram(NwdiagApp(), 'network', output_format, source or request.get_data(as_text=True))


@application.route('/<string:output_format>', methods=['POST'])
def diag(output_format):
    source = request.get_data(as_text=True)
    if source.startswith('blockdiag'):
        return blockdiag(output_format, source)
    elif source.startswith('seqdiag'):
        return seqdiag(output_format, source)
    elif source.startswith('actdiag'):
        return actdiag(output_format, source)
    elif source.startswith('nwdiag'):
        return nwdiag(output_format, source)
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
    application.run(debug=True, host='0.0.0.0', port=8001)
