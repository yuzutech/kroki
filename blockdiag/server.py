import io
import base64
import zlib
from flask import Flask, send_file, Response, make_response
from blockdiag.utils.bootstrap import create_fontmap
from blockdiag.command import BlockdiagApp
from seqdiag.command import SeqdiagApp

application = Flask(__name__)


def _generate_diagram(app, output_format, source_encoded):
    options = ['-T' + output_format, 'file']
    app.parse_options(options)

    if output_format and output_format.lower() == 'pdf':
        app.options.font = [
            '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf',
            '/usr/share/fonts/ttf-dejavu/DejaVuSerif.ttf'
        ]

    app.fontmap = create_fontmap(app.options)
    app.setup()

    app.code = zlib.decompress(base64.urlsafe_b64decode(source_encoded.encode('ascii')))

    tree = app.module.parser.parse_string(app.code)
    try:
        diagram = app.module.builder.ScreenNodeBuilder.build(tree, app.options)
    except:
        diagram = app.module.builder.ScreenNodeBuilder.build(tree)  # old interface

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


@application.route('/blockdiag/<string:output_format>/<string:source_encoded>')
def blockdiag(output_format, source_encoded):
    return _generate_diagram(BlockdiagApp(), output_format, source_encoded)


@application.route('/seqdiag/<string:output_format>/<string:source_encoded>')
def seqdiag(output_format, source_encoded):
    return _generate_diagram(SeqdiagApp(), output_format, source_encoded)


if __name__ == '__main__':
    application.run(debug=True, host='0.0.0.0')
