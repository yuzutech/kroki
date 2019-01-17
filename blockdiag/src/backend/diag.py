import base64
import zlib
from blockdiag.utils.bootstrap import create_fontmap
from blockdiag.parser import ParseException
from backend.error import GenerateError


def generate_diag(app, diagram_type, output_format, source_encoded):
    options = ['-T' + output_format, 'file']
    app.parse_options(options)

    output_format = output_format.lower()
    if output_format == 'pdf':
        app.options.font = [
            '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf',
            '/usr/share/fonts/ttf-dejavu/DejaVuSerif.ttf'
        ]

    app.fontmap = create_fontmap(app.options)
    app.setup()

    source = zlib.decompress(base64.urlsafe_b64decode(source_encoded.encode('ascii'))).decode('utf-8')
    app.code = source

    try:
        tree = app.module.parser.parse_string(app.code)
        try:
            diagram = app.module.builder.ScreenNodeBuilder.build(tree, app.options)
        except TypeError:
            diagram = app.module.builder.ScreenNodeBuilder.build(tree) # old interface

        drawer = app.module.drawer.DiagramDraw(app.options.type, diagram,
                                               None,
                                               fontmap=app.fontmap,
                                               code=app.code,
                                               antialias=app.options.antialias,
                                               nodoctype=app.options.nodoctype,
                                               transparency=app.options.transparency)
        drawer.draw()
        drawer.drawer._run()
        if output_format == 'png':
            png_image = drawer.drawer.save(None, None, drawer.format)
            return png_image
        elif output_format == 'pdf':
            pdf_drawer = drawer.drawer.target
            pdf_drawer.canvas.showPage()
            binary_pdf = pdf_drawer.canvas.getpdfdata()
            return binary_pdf
        elif output_format == 'svg':
            xml_text = drawer.drawer.save(None, None, drawer.format)
            return xml_text
    except (ParseException, RuntimeError) as err:
        raise GenerateError('Unable to generate the ' + diagram_type + ' diagram from source',
                            status_code=500,
                            payload={
                                'source': source,
                                'output_format': output_format,
                                'diagram_type': diagram_type
                            })
