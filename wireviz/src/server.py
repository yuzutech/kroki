import io
from flask import Flask, send_file, make_response, jsonify
from wireviz.wireviz import parse
from backend.error import GenerateError
from flask import request
from wireviz import __version__ as wireviz_version
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


@application.route('/_status', methods=['GET'])
def status():
    return jsonify(
        name='wireviz',
        version={
            'wireviz': wireviz_version
        }
    )

@application.route('/wireviz/<string:output_format>', methods=['POST'])
def wireviz(output_format, source=None):
    types = {"svg": "image/svg+xml", "png": "image/png"}
    if output_format in types:
        config = source or request.get_data(cache=False, as_text=True, parse_form_data=False)
        try:
            graph = parse(yaml_input=config, return_types=output_format)
            return make_response(graph)
        except Exception as err:
            raise GenerateError('Unable to generate the wireviz diagram from source',
                                status_code=400,
                                payload={
                                    'source': source,
                                    'output_format': output_format,
                                    'diagram_type': 'wireviz',
                                    'error': str(err)
                                })
    else:
        raise InvalidUsage('Unsupported output format: %s. Must be one of: png or svg.' % output_format,
                            status_code=400)

@application.route('/<string:output_format>', methods=['POST'])
def diag(output_format):
    source = request.get_data(as_text=True)
    if source.startswith('wireviz'):
        return wireviz(output_format, source)
    else:
        raise InvalidUsage('Diagram source must begin with the following: wireviz',
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
    application.run(debug=True, host='0.0.0.0', port=8006)
