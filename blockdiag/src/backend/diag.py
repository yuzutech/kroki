from blockdiag.utils.bootstrap import create_fontmap
from blockdiag.parser import ParseException
from backend.error import GenerateError
import re

SVG_PREAMBLE_REGEX = re.compile(r'\A.*?(?=<svg\b)', re.MULTILINE | re.DOTALL)
START_TAG_REGEX = re.compile(r'<svg[^>]*>')
WIDTH_REGEX = re.compile(r'width="(?P<value>\d+(?:\.\d+)?)(?P<unit>[a-zA-Z]+)?"')
HEIGHT_REGEX = re.compile(r'height="(?P<value>\d+(?:\.\d+)?)(?P<unit>[a-zA-Z]+)?"')
VIEWBOX_REGEX = re.compile(r'viewBox="\d+(?:\.\d+)? \d+(?:\.\d+)? (?P<width>\d+(?:\.\d+)?) (?P<height>\d+(?:\.\d+)?)"')


def set_dimension_attributes(data):
    svg_preamble_match = SVG_PREAMBLE_REGEX.match(data)
    if svg_preamble_match:
        svg_preamble = svg_preamble_match.group(0)
        svg = re.sub(SVG_PREAMBLE_REGEX, '', data)
        start_tag_match = START_TAG_REGEX.match(svg)
        if start_tag_match:
            start_tag = start_tag_match.group(0)
            width_found = WIDTH_REGEX.search(start_tag)
            height_found = HEIGHT_REGEX.search(start_tag)
            if height_found and width_found:
                # width and height are already present!
                return data

            viewbox_found = VIEWBOX_REGEX.search(start_tag)
            if viewbox_found:
                width = viewbox_found.group('width')
                height = viewbox_found.group('height')
                new_start_tag = start_tag[:-1] + f' width=\"{width}px\" height=\"{height}px\">'
                return svg_preamble + new_start_tag + f'{svg[len(start_tag):-1]}'

    # svg does not match the expected format!
    return data


def generate_diag(app, diagram_type, output_format, source, options):
    output_format = output_format.lower()
    cli_options = ['-T' + output_format]
    antialias = options.get('antialias')
    if antialias is not None:
        cli_options.append('--antialias')

    no_transparency = options.get('no-transparency')
    if no_transparency is not None and output_format == 'png':
        cli_options.append('--no-transparency')

    size = options.get('size')
    if size is not None:
        cli_options.append('--size=' + size)

    no_doctype = options.get('no-doctype')
    if no_doctype is not None and output_format == 'svg':
        cli_options.append('--nodoctype')

    cli_options.append('file')
    app.parse_options(cli_options)

    app.options.font = [
        '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf'
        '/usr/share/fonts/dejavu/DejaVuSerif.ttf',
    ]

    app.fontmap = create_fontmap(app.options)
    app.setup()

    app.code = source
    try:
        tree = app.module.parser.parse_string(app.code)
        try:
            diagram = app.module.builder.ScreenNodeBuilder.build(tree, app.options)
        except TypeError:
            diagram = app.module.builder.ScreenNodeBuilder.build(tree)  # old interface

        drawer = app.module.drawer.DiagramDraw(app.options.type, diagram,
                                               None,
                                               fontmap=app.fontmap,
                                               code=app.code,
                                               antialias=app.options.antialias,
                                               nodoctype=app.options.nodoctype,
                                               transparency=app.options.transparency)
        drawer.draw()
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
            return set_dimension_attributes(xml_text)
    except (ParseException, Exception) as err:
        raise GenerateError('Unable to generate the ' + diagram_type + ' diagram from source',
                            status_code=400,
                            payload={
                                'source': source,
                                'output_format': output_format,
                                'diagram_type': diagram_type,
                                'error': str(err)
                            })
