/**
 * Copyright (c) 2006-2015, JGraph Holdings Ltd
 * Copyright (c) 2006-2015, draw.io AG
 */
mxCodecRegistry.register(function()
{
	/**
	 * Class: mxModelCodec
	 *
	 * Codec for <mxGraphModel>s. This class is created and registered
	 * dynamically at load time and used implicitly via <mxCodec>
	 * and the <mxCodecRegistry>.
	 */
	var codec = new mxObjectCodec(new mxGraphModel());

	/**
	 * Global switch to enable style compression for images and shapes.
	 * Default is false.
	 */
	codec.enableStyleCompression = false;

	/**
	 * Function: encodeObject
	 *
	 * Encodes the given <mxGraphModel> by writing a (flat) XML sequence of
	 * cell nodes as produced by the <mxCellCodec>. The sequence is
	 * wrapped-up in a node with the name root.
	 */
	codec.encodeObject = function(enc, obj, node)
	{
		var rootNode = enc.document.createElement('root');
		enc.encodeCell(obj.getRoot(), rootNode);
		node.appendChild(rootNode);

		// Adds resources to defs
		if (this.enableStyleCompression)
		{
			var defs = this.encodeResources(enc, rootNode,
				enc.document.createElement('defs'));
			
			if (defs.childNodes.length > 0)
			{
				rootNode.parentNode.insertBefore(defs, rootNode);
			}
		}
	};

	/**
	 * Function: encodeResources
	 * 
	 * Adds resources for images and shapes in styles to the given defs node.
	 */	
	codec.encodeResources = function(enc, rootNode, defs)
	{
		var cells = rootNode.getElementsByTagName('mxCell');
		var lookup = {};

		for (var i = 0; i < cells.length; i++)
		{
			this.compressCellStyle(enc, defs, lookup, cells[i]);
		}

		return defs;
	};

	/**
	 * Function: compressCellStyle
	 * 
	 * Processes the given style string and replaces data URLs and stenctils
	 * with references in defs.
	 */
	codec.compressCellStyle = function(enc, defs, lookup, cell)
	{
		var style = cell.getAttribute('style');

		if (style != null && (style.indexOf('=data:') !== -1 ||
			style.indexOf('=stencil(') !== -1))
		{
			var styles = style.split(';');

			for (var j = 0; j < styles.length; j++)
			{
				var parts = styles[j].split('=');

				if (parts.length > 1 &&
					(parts[0] === 'image' && parts[1].startsWith('data:image/') ||
					parts[0] === 'shape' && parts[1].startsWith('stencil(')))
				{
					(mxUtils.bind(this, function(key, index)
					{
						this.addResource(enc, defs, parts[1], lookup, function(id)
						{
							cell.setAttribute('style', styles.slice(0, index).join(';') +
								(index > 0 ? ';' : '') + key + '=def(' + id + ');' +
								styles.slice(index + 1).join(';'));
						});
					}))(parts[0], j);
				}
			}
		}
	};

	/**
	 * Function: addResource
	 * 
	 * Creates a definition for the given data URL or stencil in defs
	 * if it does not yet exist and calls the given function with the
	 * def index. This adds the entry on the second use of the data.
	 */	
	codec.addResource = function(enc, defs, data, lookup, fn)
	{
		var item = lookup[data];

		if (item != null)
		{
			if (item.id == null)
			{
				item.id = defs.getElementsByTagName('*').length;
				defs.appendChild(item.elt);
				item.fn(item.id);
				delete item.elt;
				delete item.fn;
			}
			
			fn(item.id);
		}
		else
		{
			var elt = enc.document.createElement('def');
			lookup[data] = {elt: elt, fn: fn, id: null};
			elt.setAttribute('data', data);
		}
	};

	/**
	 * Function: decodeChild
	 * 
	 * Overrides decode child to handle special child nodes.
	 */	
	codec.decodeChild = function(dec, child, obj)
	{
		if (child.nodeName == 'defs')
		{
			this.decodeResources(dec, child, obj);
		}
		else if (child.nodeName == 'root')
		{
			this.decodeRoot(dec, child, obj);
		}
		else
		{
			mxObjectCodec.prototype.decodeChild.apply(this, arguments);
		}
	};

	/**
	 * Function: decodeResources
	 * 
	 * Replaces references to images and shapes in styles with data.
	 */	
	codec.decodeResources = function(dec, child, obj)
	{
		var cells = child.parentNode.getElementsByTagName('mxCell');
		var defs = child.getElementsByTagName('def');

		for (var i = 0; i < cells.length; i++)
		{
			this.decompressCellStyle(dec, defs, cells[i]);
		}
	};

	/**
	 * Function: decompressCellStyle
	 * 
	 * Processes the given style string and replaces references with data in defs.
	 */	
	codec.decompressCellStyle = function(dec, defs, cell)
	{
		var style = cell.getAttribute('style');

		if (style != null && style.indexOf('=def(') !== -1)
		{
			var styles = style.split(';');
			var newStyles = [];
					
			for (var j = 0; j < styles.length; j++)
			{
				var parts = styles[j].split('=');

				if (parts.length > 1 && parts[1].startsWith('def(') &&
					(parts[0] === 'image' || parts[0] === 'shape'))
				{
					var index = parts[1].substring(
						parts[1].indexOf('(') + 1,
						parts[1].length - 1);

					if (defs[index] != null)
					{
						newStyles.push(parts[0] + '=' +
							defs[index].getAttribute('data'));
					}
					else if (window.console != null)
					{
						console.error('mxModelCodec.decodeChild: Invalid reference ' +
							index + ' in cell ' + cells[i].getAttribute('index'));
					}
				}
				else
				{
					newStyles.push(styles[j]);
				}
			}

			cell.setAttribute('style', newStyles.join(';'));
		}
	};

	/**
	 * Function: decodeRoot
	 *
	 * Reads the cells into the graph model. All cells
	 * are children of the root element in the node.
	 */
	codec.decodeRoot = function(dec, root, model)
	{
		var rootCell = null;
		var tmp = root.firstChild;
		
		while (tmp != null)
		{
			var cell = dec.decodeCell(tmp);
			
			if (cell != null && cell.getParent() == null)
			{
				rootCell = cell;
			}
			
			tmp = tmp.nextSibling;
		}

		// Sets the root on the model if one has been decoded
		if (rootCell != null)
		{
			model.setRoot(rootCell);
		}
	};

	// Returns the codec into the registry
	return codec;

}());
