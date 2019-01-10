import io
from flask import Flask, send_file
from blockdiag.utils.bootstrap import create_fontmap
from blockdiag.command import BlockdiagApp

app = Flask(__name__)

@app.route('/')
def hello():
    blockdiag = BlockdiagApp()
    options = ['file']
    blockdiag.parse_options(options)
    blockdiag.fontmap = create_fontmap(blockdiag.options)
    blockdiag.setup()
    blockdiag.code = """
blockdiag {
 blockdiag -> generates -> "block-diagrams";
 blockdiag -> is -> "very easy!";

 blockdiag [color = "greenyellow"];
 "block-diagrams" [color = "pink"];
 "very easy!" [color = "orange"];
}
"""
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
    bin_text = drawer.drawer.save(None, None, drawer.format)
    return send_file(io.BytesIO(bin_text),
                     attachment_filename='result.png',
                     mimetype='image/png')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
