import io
import base64
import zlib
from flask import Flask, send_file, Response, make_response
from blockdiag.utils.bootstrap import create_fontmap
from blockdiag.command import BlockdiagApp

application = Flask(__name__)


@application.route('/<string:output_format>/<string:source_encoded>')
def hello(output_format, source_encoded):
    blockdiag = BlockdiagApp()
    options = ['-T' + output_format, 'file']
    blockdiag.parse_options(options)

    if output_format and output_format.lower() == 'pdf':
        blockdiag.options.font = [
            '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf',
            '/usr/share/fonts/ttf-dejavu/DejaVuSerif.ttf'
        ]

    blockdiag.fontmap = create_fontmap(blockdiag.options)
    blockdiag.setup()

    blockdiag.code = zlib.decompress(base64.urlsafe_b64decode(source_encoded.encode('ascii')))

    tree = blockdiag.module.parser.parse_string(blockdiag.code)
    try:
        diagram = blockdiag.module.builder.ScreenNodeBuilder.build(tree, blockdiag.options)
    except:
        diagram = blockdiag.module.builder.ScreenNodeBuilder.build(tree)  # old interface

    drawer = blockdiag.module.drawer.DiagramDraw(blockdiag.options.type, diagram,
                                                 None,
                                                 fontmap=blockdiag.fontmap,
                                                 code=blockdiag.code,
                                                 antialias=blockdiag.options.antialias,
                                                 nodoctype=blockdiag.options.nodoctype,
                                                 transparency=blockdiag.options.transparency)

    drawer.draw()
    drawer.drawer._run()
    if blockdiag.options.type == 'PNG':
        bin_text = drawer.drawer.save(None, None, drawer.format)
        return send_file(io.BytesIO(bin_text),
                         attachment_filename='result.png',
                         mimetype='image/png')
    elif blockdiag.options.type == 'PDF':
        pdf_drawer = drawer.drawer.target
        pdf_drawer.canvas.showPage()
        binary_pdf = pdf_drawer.canvas.getpdfdata()
        response = make_response(binary_pdf)
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = 'inline; filename=%s.pdf' % 'result'
        return response
    elif blockdiag.options.type == 'SVG':
        xml_text = drawer.drawer.save(None, None, drawer.format)
        response = Response(xml_text, mimetype='image/svg+xml')
        response.headers["Content-Type"] = "image/svg+xml; charset=utf-8"
        return response


if __name__ == '__main__':
    application.run(debug=True, host='0.0.0.0')
