/**
 * $Id: mxBasic.js,v 1.5 2016/04/1 12:32:06 mate Exp $
 * Copyright (c) 2006-2018, JGraph Ltd
 */
//**********************************************************************************************************************************************************
// Cross
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicCross(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.dx = 0.5;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasicCross, mxActor);

mxShapeBasicCross.prototype.cst = {CROSS : 'mxgraph.basic.cross2'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicCross.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	var dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));

	c.begin();
	c.moveTo(w * 0.5 + dx, 0);
	c.lineTo(w * 0.5 + dx, h * 0.5 - dx);
	c.lineTo(w, h * 0.5 - dx);
	c.lineTo(w, h * 0.5 + dx);
	c.lineTo(w * 0.5 + dx, h * 0.5 + dx);
	c.lineTo(w * 0.5 + dx, h);
	c.lineTo(w * 0.5 - dx, h);
	c.lineTo(w * 0.5 - dx, h * 0.5 + dx);
	c.lineTo(0, h * 0.5 + dx);
	c.lineTo(0, h * 0.5 - dx);
	c.lineTo(w * 0.5 - dx, h * 0.5 - dx);
	c.lineTo(w * 0.5 - dx, 0);
	c.close();
	c.fillAndStroke();
};

mxCellRenderer.registerShape(mxShapeBasicCross.prototype.cst.CROSS, mxShapeBasicCross);

mxShapeBasicCross.prototype.constraints = null;

Graph.handleFactory[mxShapeBasicCross.prototype.cst.CROSS] = function(state)
{
	var handles = [Graph.createHandle(state, ['dx'], function(bounds)
	{
		var dx = Math.max(0, Math.min(bounds.width / 2, bounds.width / 2, parseFloat(mxUtils.getValue(this.state.style, 'dx', this.dx))));

		return new mxPoint(bounds.x + bounds.width / 2 + dx, bounds.y + bounds.height / 2 - dx);
	}, function(bounds, pt)
	{
		this.state.style['dx'] = Math.round(100 * Math.max(0, Math.min(bounds.height / 2, bounds.width / 2, pt.x - bounds.x - bounds.width / 2))) / 100;
	})];
			
	return handles;
};

//**********************************************************************************************************************************************************
// Rectangular Callout
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicRectCallout(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.dy = 0.5;
	this.dx = 0.5;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasicRectCallout, mxActor);

mxShapeBasicRectCallout.prototype.customProperties = [
	{name: 'dx', dispName: 'Callout Position', type: 'float', min:0, defVal:30},
	{name: 'dy', dispName: 'Callout Size', type: 'float', min:0, defVal:15}
];

mxShapeBasicRectCallout.prototype.cst = {RECT_CALLOUT : 'mxgraph.basic.rectCallout'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicRectCallout.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	var dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));
	var dy = Math.max(0, Math.min(h, parseFloat(mxUtils.getValue(this.style, 'dy', this.dy))));

	c.begin();
	c.moveTo(dx - dy * 0.5, h - dy);
	c.lineTo(0, h - dy);
	c.lineTo(0, 0);
	c.lineTo(w, 0);
	c.lineTo(w, h - dy);
	c.lineTo(dx + dy * 0.5, h - dy);
	c.lineTo(dx - dy, h);
	c.close();
	c.fillAndStroke();
};

mxShapeBasicRectCallout.prototype.getLabelMargins = function()
{
	if (mxUtils.getValue(this.style, 'boundedLbl', false))
	{
		return new mxRectangle(0, 0, 0, parseFloat(mxUtils.getValue(this.style, 'dy', this.dy)) * this.scale);
	}
	
	return null;
};

mxCellRenderer.registerShape(mxShapeBasicRectCallout.prototype.cst.RECT_CALLOUT, mxShapeBasicRectCallout);

Graph.handleFactory[mxShapeBasicRectCallout.prototype.cst.RECT_CALLOUT] = function(state)
{
	var handles = [Graph.createHandle(state, ['dx', 'dy'], function(bounds)
	{
		var dx = Math.max(0, Math.min(bounds.width, parseFloat(mxUtils.getValue(this.state.style, 'dx', this.dx))));
		var dy = Math.max(0, Math.min(bounds.height, parseFloat(mxUtils.getValue(this.state.style, 'dy', this.dy))));

		return new mxPoint(bounds.x + dx, bounds.y + bounds.height - dy);
	}, function(bounds, pt)
	{
		var y = parseFloat(mxUtils.getValue(this.state.style, 'dy', this.dy)) * 0.6;
		this.state.style['dx'] = Math.round(100 * Math.max(y, Math.min(bounds.width - y, pt.x - bounds.x))) / 100;
		this.state.style['dy'] = Math.round(Math.max(0, Math.min(bounds.height, bounds.y + bounds.height - pt.y)));
	})];
			
	return handles;
};

mxShapeBasicRectCallout.prototype.getConstraints = function(style, w, h)
{
	var constr = [];
	var dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));
	var dy = Math.max(0, Math.min(h, parseFloat(mxUtils.getValue(this.style, 'dy', this.dy))));

	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0.25, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0.75, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w, (h - dy) * 0.5));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w, h - dy));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, dx - dy, h));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, 0, h - dy));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, 0, (h - dy) * 0.5));

	return (constr);
}

//**********************************************************************************************************************************************************
// Rounded Rectangular Callout
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicRoundRectCallout(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.dy = 0.5;
	this.dx = 0.5;
	this.size = 10;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasicRoundRectCallout, mxActor);

mxShapeBasicRoundRectCallout.prototype.cst = {ROUND_RECT_CALLOUT : 'mxgraph.basic.roundRectCallout'};

mxShapeBasicRoundRectCallout.prototype.getLabelMargins = mxShapeBasicRectCallout.prototype.getLabelMargins;

mxShapeBasicRoundRectCallout.prototype.customProperties = [
	{name: 'size', dispName: 'Arc Size', type: 'float', min:0, defVal:5},
	{name: 'dx', dispName: 'Callout Position', type: 'float', min:0, defVal:30},
	{name: 'dy', dispName: 'Callout Size', type: 'float', min:0, defVal:15}
];

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicRoundRectCallout.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	var dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));
	var dy = Math.max(0, Math.min(h, parseFloat(mxUtils.getValue(this.style, 'dy', this.dy))));
	var r = Math.max(0, Math.min(h, parseFloat(mxUtils.getValue(this.style, 'size', this.size))));

	r = Math.min((h - dy) / 2, w / 2, r);
	dx = Math.max(r + dy * 0.5, dx);
	dx = Math.min(w - r - dy * 0.5, dx);
	
	c.begin();
	c.moveTo(dx - dy * 0.5, h - dy);
	c.lineTo(r, h - dy);
	c.arcTo(r, r, 0, 0, 1, 0, h - dy - r);
	c.lineTo(0, r);
	c.arcTo(r, r, 0, 0, 1, r, 0);
	c.lineTo(w - r, 0);
	c.arcTo(r, r, 0, 0, 1, w, r);
	c.lineTo(w, h - dy - r);
	c.arcTo(r, r, 0, 0, 1, w - r, h - dy);
	c.lineTo(dx + dy * 0.5, h - dy);
	c.arcTo(1.9 * dy, 1.4 * dy, 0, 0, 1, dx - dy, h);
	c.arcTo(0.9 * dy, 1.4 * dy, 0, 0, 0, dx - dy * 0.5, h - dy);
	c.close();
	c.fillAndStroke();
};

mxCellRenderer.registerShape(mxShapeBasicRoundRectCallout.prototype.cst.ROUND_RECT_CALLOUT, mxShapeBasicRoundRectCallout);

mxShapeBasicRoundRectCallout.prototype.constraints = null;

Graph.handleFactory[mxShapeBasicRoundRectCallout.prototype.cst.ROUND_RECT_CALLOUT] = function(state)
{
	return [Graph.createHandle(state, ['dx', 'dy'], function(bounds)
	{
		var dx = Math.max(0, Math.min(bounds.width, parseFloat(mxUtils.getValue(this.state.style, 'dx', this.dx))));
		var dy = Math.max(0, Math.min(bounds.height, parseFloat(mxUtils.getValue(this.state.style, 'dy', this.dy))));

		return new mxPoint(bounds.x + dx, bounds.y + bounds.height - dy);
	}, function(bounds, pt)
	{
		var y = parseFloat(mxUtils.getValue(this.state.style, 'dy', this.dy)) * 0.6;
		this.state.style['dx'] = Math.round(100 * Math.max(y, Math.min(bounds.width - y, pt.x - bounds.x))) / 100;
		this.state.style['dy'] = Math.round(Math.max(0, Math.min(bounds.height, bounds.y + bounds.height - pt.y)));
	}), Graph.createHandle(state, ['size'], function(bounds)
	{
		var size = Math.max(0, Math.min(bounds.width, parseFloat(mxUtils.getValue(this.state.style, 'size', this.size))));

		return new mxPoint(bounds.x + bounds.width - size, bounds.y + 10);
	}, function(bounds, pt)
	{
		var dy = parseFloat(mxUtils.getValue(this.state.style, 'dy', this.dy));
		this.state.style['size'] = Math.round(100 * Math.max(0, Math.min(bounds.width / 2, (bounds.height - dy) / 2, bounds.x + bounds.width - pt.x))) / 100;
	})];
};

mxShapeBasicRoundRectCallout.prototype.getConstraints = function(style, w, h)
{
	var constr = [];
	var dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));
	var dy = Math.max(0, Math.min(h, parseFloat(mxUtils.getValue(this.style, 'dy', this.dy))));
	var r = Math.max(0, Math.min(h, parseFloat(mxUtils.getValue(this.style, 'size', this.size))));

	r = Math.min((h - dy) / 2, w / 2, r);
	dx = Math.max(r + dy * 0.5, dx);
	dx = Math.min(w - r - dy * 0.5, dx);
	
	if (r < w * 0.25)
	{
		constr.push(new mxConnectionConstraint(new mxPoint(0.25, 0), false));
		constr.push(new mxConnectionConstraint(new mxPoint(0.75, 0), false));
	}
	
	if (r < (h - dy) * 0.25)
	{
		constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w, (h - dy) * 0.25));
		constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w, (h - dy) * 0.75));
		constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, 0, (h - dy) * 0.25));
		constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, 0, (h - dy) * 0.75));
	}

	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, r * 0.293, r * 0.293));
	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w - r * 0.293, r * 0.293));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w, (h - dy) * 0.5));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, 0, (h - dy) * 0.5));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w - r * 0.293, h - dy - r * 0.293));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, r * 0.293, h - dy - r * 0.293));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, dx - dy, h));

	return (constr);
}

//**********************************************************************************************************************************************************
// Wave
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicWave(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.dy = 0.5;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasicWave, mxActor);

mxShapeBasicWave.prototype.customProperties = [
	{name: 'dy', dispName: 'Wave Size', type: 'float', min:0, max:1, defVal: 0.3}
];

mxShapeBasicWave.prototype.cst = {WAVE : 'mxgraph.basic.wave2'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicWave.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	var dy = h * Math.max(0, Math.min(h, parseFloat(mxUtils.getValue(this.style, 'dy', this.dy))));
	var fy = 1.4
	
	c.begin();
	c.moveTo(0, dy / 2);
	c.quadTo(w / 6, dy * (1 - fy), w / 3, dy / 2);
	c.quadTo(w / 2, dy * fy, w * 2 / 3, dy / 2);
	c.quadTo(w * 5 / 6, dy * (1 - fy), w, dy / 2);
	c.lineTo(w, h - dy / 2);
	c.quadTo(w * 5 / 6, h - dy * fy, w * 2 / 3, h - dy / 2);
	c.quadTo(w / 2, h - dy * (1 - fy), w / 3, h - dy / 2);
	c.quadTo(w / 6, h - dy * fy, 0, h - dy / 2);
	c.close();
	c.fillAndStroke();
};

mxCellRenderer.registerShape(mxShapeBasicWave.prototype.cst.WAVE, mxShapeBasicWave);

mxShapeBasicWave.prototype.constraints = null;

Graph.handleFactory[mxShapeBasicWave.prototype.cst.WAVE] = function(state)
{
	var handles = [Graph.createHandle(state, ['dy'], function(bounds)
	{
		var dy = Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.state.style, 'dy', this.dy))));

		return new mxPoint(bounds.x + bounds.width / 2, bounds.y + dy * bounds.height);
	}, function(bounds, pt)
	{
		this.state.style['dy'] = Math.round(100 * Math.max(0, Math.min(1, (pt.y - bounds.y) / bounds.height))) / 100;
	})];

	return handles;
};

mxShapeBasicWave.prototype.getConstraints = function(style, w, h)
{
	var constr = [];
	var dy = h * Math.max(0, Math.min(h, parseFloat(mxUtils.getValue(this.style, 'dy', this.dy))));
	var fy = 1.4
	
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, 0, dy * 0.5));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w / 6, h * 0.015));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w / 3, dy * 0.5));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w * 0.5, dy * 0.95));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w * 0.67, dy * 0.5));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w * 0.83, h * 0.015));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w, dy * 0.5));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w, h * 0.5));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w, h - dy * 0.5));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w * 0.83, h - dy * 0.95));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w * 0.67, h - dy * 0.5));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w * 0.5, h - dy * 0.04));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w / 3, h - dy * 0.5));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w / 6, h - dy * 0.95));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, 0, h - dy * 0.5));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, 0, h * 0.5));

	return (constr);
}

//**********************************************************************************************************************************************************
//Octagon
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicOctagon(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.dx = 0.5;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasicOctagon, mxActor);

mxShapeBasicOctagon.prototype.customProperties = [
	{name: 'dx', dispName: 'Cutoff Size', type: 'float', min:0, defVal:15}
];

mxShapeBasicOctagon.prototype.cst = {OCTAGON : 'mxgraph.basic.octagon2'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicOctagon.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	var dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx)))) * 2;

	dx = Math.min(w * 0.5, h * 0.5, dx);
	
	c.begin();
	c.moveTo(dx, 0);
	c.lineTo(w - dx, 0);
	c.lineTo(w, dx);
	c.lineTo(w, h - dx);
	c.lineTo(w - dx, h);
	c.lineTo(dx, h);
	c.lineTo(0, h - dx);
	c.lineTo(0, dx);
	c.close();
	c.fillAndStroke();
};

mxCellRenderer.registerShape(mxShapeBasicOctagon.prototype.cst.OCTAGON, mxShapeBasicOctagon);

mxShapeBasicOctagon.prototype.constraints = null;

Graph.handleFactory[mxShapeBasicOctagon.prototype.cst.OCTAGON] = function(state)
{
	var handles = [Graph.createHandle(state, ['dx'], function(bounds)
	{
		var dx = Math.max(0, Math.min(bounds.width / 4, bounds.width / 4, parseFloat(mxUtils.getValue(this.state.style, 'dx', this.dx))));

		return new mxPoint(bounds.x + dx, bounds.y + dx);
	}, function(bounds, pt)
	{
		this.state.style['dx'] = Math.round(100 * Math.max(0, Math.min(bounds.height / 4, bounds.width / 4, pt.x - bounds.x))) / 100;
	})];
			
	return handles;
};

mxShapeBasicOctagon.prototype.getConstraints = function(style, w, h)
{
	var constr = [];
	var dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx)))) * 2;

	dx = Math.min(w * 0.5, h * 0.5, dx) * 0.5;
	
	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 1), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0.5), false));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 0.5), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, dx, dx));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w - dx, dx));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w - dx, h - dx));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, dx, h - dx));

	return (constr);
}

//**********************************************************************************************************************************************************
//Isometric Cube
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicIsoCube(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.isoAngle = 15;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasicIsoCube, mxActor);

mxShapeBasicIsoCube.prototype.customProperties = [
	{name: 'isoAngle', dispName: 'Perspective Angle', type: 'float', min:0, defVal:15}
];

mxShapeBasicIsoCube.prototype.cst = {ISO_CUBE : 'mxgraph.basic.isocube'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicIsoCube.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	var isoAngle = Math.max(0.01, Math.min(94, parseFloat(mxUtils.getValue(this.style, 'isoAngle', this.isoAngle)))) * Math.PI / 200 ;
	var isoH = Math.min(w * Math.tan(isoAngle), h * 0.5);
	
	c.begin();
	c.moveTo(w * 0.5, 0);
	c.lineTo(w, isoH);
	c.lineTo(w, h - isoH);
	c.lineTo(w * 0.5, h);
	c.lineTo(0, h - isoH);
	c.lineTo(0, isoH);
	c.close();
	c.fillAndStroke();

	c.setShadow(false);
	
	c.begin();
	c.moveTo(0, isoH);
	c.lineTo(w * 0.5, 2 * isoH);
	c.lineTo(w, isoH);
	c.moveTo(w * 0.5, 2 * isoH);
	c.lineTo(w * 0.5, h);
	c.stroke();
};

mxCellRenderer.registerShape(mxShapeBasicIsoCube.prototype.cst.ISO_CUBE, mxShapeBasicIsoCube);

mxShapeBasicIsoCube.prototype.constraints = null;

Graph.handleFactory[mxShapeBasicIsoCube.prototype.cst.ISO_CUBE] = function(state)
{
	var handles = [Graph.createHandle(state, ['isoAngle'], function(bounds)
	{
		var isoAngle = Math.max(0.01, Math.min(94, parseFloat(mxUtils.getValue(this.state.style, 'isoAngle', this.isoAngle)))) * Math.PI / 200 ;
		var isoH = Math.min(bounds.width * Math.tan(isoAngle), bounds.height * 0.5);

		return new mxPoint(bounds.x, bounds.y + isoH);
	}, function(bounds, pt)
	{
		this.state.style['isoAngle'] = Math.round(100 * Math.max(0, Math.min(100, pt.y - bounds.y))) / 100;
	})];
			
	return handles;
};

mxShapeBasicIsoCube.prototype.getConstraints = function(style, w, h)
{
	var constr = [];
	var isoAngle = Math.max(0.01, Math.min(94, parseFloat(mxUtils.getValue(this.style, 'isoAngle', this.isoAngle)))) * Math.PI / 200 ;
	var isoH = Math.min(w * Math.tan(isoAngle), h * 0.5);
	
	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w, isoH));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 0.5), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w, h - isoH));
	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 1), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, 0, h - isoH));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0.5), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, 0, isoH));

	return (constr);
}

//**********************************************************************************************************************************************************
//Acute Triangle
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicTriangleAcute(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.dx = 0.5;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasicTriangleAcute, mxActor);

mxShapeBasicTriangleAcute.prototype.customProperties = [
	{name: 'dx', dispName: 'Top', type: 'float', min:0, max:1, defVal:0.5}
];

mxShapeBasicTriangleAcute.prototype.cst = {ACUTE_TRIANGLE : 'mxgraph.basic.acute_triangle'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicTriangleAcute.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	var dx = w * Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));
	
	c.begin();
	c.moveTo(0, h);
	c.lineTo(dx, 0);
	c.lineTo(w, h);
	c.close();
	c.fillAndStroke();
};

mxCellRenderer.registerShape(mxShapeBasicTriangleAcute.prototype.cst.ACUTE_TRIANGLE, mxShapeBasicTriangleAcute);

mxShapeBasicTriangleAcute.prototype.constraints = null;

Graph.handleFactory[mxShapeBasicTriangleAcute.prototype.cst.ACUTE_TRIANGLE] = function(state)
{
	var handles = [Graph.createHandle(state, ['dx'], function(bounds)
	{
		var dx = Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.state.style, 'dx', this.dx))));

		return new mxPoint(bounds.x + dx * bounds.width, bounds.y + 10);
	}, function(bounds, pt)
	{
		this.state.style['dx'] = Math.round(100 * Math.max(0, Math.min(1, (pt.x - bounds.x) / bounds.width))) / 100;
	})];

	return handles;
};

mxShapeBasicTriangleAcute.prototype.getConstraints = function(style, w, h)
{
	var constr = [];
	var dx = w * Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));
	
	constr.push(new mxConnectionConstraint(new mxPoint(1, 1), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 1), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 1), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, dx, 0));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, dx * 0.5, h * 0.5));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w - (w - dx) * 0.5, h * 0.5));

	return (constr);
}

//**********************************************************************************************************************************************************
//Obtuse Triangle
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicTriangleObtuse(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.dx = 0.5;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasicTriangleObtuse, mxActor);

mxShapeBasicTriangleObtuse.prototype.customProperties = [
	{name: 'dx', dispName: 'Bottom', type: 'float', min:0, max:1, defVal:0.25}
];

mxShapeBasicTriangleObtuse.prototype.cst = {OBTUSE_TRIANGLE : 'mxgraph.basic.obtuse_triangle'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicTriangleObtuse.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	var dx = w * Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));
	
	c.begin();
	c.moveTo(dx, h);
	c.lineTo(0, 0);
	c.lineTo(w, h);
	c.close();
	c.fillAndStroke();
};

mxCellRenderer.registerShape(mxShapeBasicTriangleObtuse.prototype.cst.OBTUSE_TRIANGLE, mxShapeBasicTriangleObtuse);

mxShapeBasicTriangleObtuse.prototype.constraints = null;

Graph.handleFactory[mxShapeBasicTriangleObtuse.prototype.cst.OBTUSE_TRIANGLE] = function(state)
{
	var handles = [Graph.createHandle(state, ['dx'], function(bounds)
	{
		var dx = Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.state.style, 'dx', this.dx))));

		return new mxPoint(bounds.x + dx * bounds.width, bounds.y + bounds.height - 10);
	}, function(bounds, pt)
	{
		this.state.style['dx'] = Math.round(100 * Math.max(0, Math.min(1, (pt.x - bounds.x) / bounds.width))) / 100;
	})];

	return handles;
};

mxShapeBasicTriangleObtuse.prototype.getConstraints = function(style, w, h)
{
	var constr = [];
	var dx = w * Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));
	
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 1), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w * 0.5, h * 0.5));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, (w + dx) * 0.5, h));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, dx, h));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, dx * 0.5, h * 0.5));

	return (constr);
}

//**********************************************************************************************************************************************************
//Drop
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicDrop(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasicDrop, mxActor);

mxShapeBasicDrop.prototype.cst = {DROP : 'mxgraph.basic.drop'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicDrop.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	var r = Math.min(h, w) * 0.5;
	var d = h - r;
	var a = Math.sqrt(d * d - r * r);
	
	var angle = Math.atan(a / r);
	
	var x1 = r * Math.sin(angle);
	var y1 = r * Math.cos(angle);
	
	c.begin();
	c.moveTo(w * 0.5, 0);
	c.lineTo(w * 0.5 + x1, h - r - y1);
	c.arcTo(r, r, 0, 0, 1, w * 0.5 + r, h - r);
	c.arcTo(r, r, 0, 0, 1, w * 0.5, h);
	c.arcTo(r, r, 0, 0, 1, w * 0.5 - r, h - r);
	c.arcTo(r, r, 0, 0, 1, w * 0.5 - x1, h - r - y1);
	c.close();
	c.fillAndStroke();
};

mxCellRenderer.registerShape(mxShapeBasicDrop.prototype.cst.DROP, mxShapeBasicDrop);

mxShapeBasicDrop.prototype.constraints = null;

//**********************************************************************************************************************************************************
//Cone 2
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicCone2(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.dx = 0.5;
	this.dy = 0.9;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasicCone2, mxActor);

mxShapeBasicCone2.prototype.customProperties = [
	{name: 'dx', dispName: 'Top', type: 'float', min:0, max:1, defVal:0.5},
	{name: 'dy', dispName: 'Bottom', type: 'float', min:0, max:1, defVal:0.9}
];

mxShapeBasicCone2.prototype.cst = {CONE2 : 'mxgraph.basic.cone2'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicCone2.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	var dx = w * Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));
	var dy = h * Math.max(0, Math.min(h, parseFloat(mxUtils.getValue(this.style, 'dy', this.dy))));
	
	var ry = h - dy;
	
	c.begin();
	c.moveTo(dx, 0);
	
	if (ry > 0)
	{
		c.lineTo(w, h - ry);
		c.arcTo(w * 0.5, ry, 0, 0, 1, w * 0.5, h);
		c.arcTo(w * 0.5, ry, 0, 0, 1, 0, h - ry);
	}
	else
	{
		c.lineTo(w, h);
		c.lineTo(0, h);
	}
	
	c.close();
	c.fillAndStroke();
};

mxCellRenderer.registerShape(mxShapeBasicCone2.prototype.cst.CONE2, mxShapeBasicCone2);

mxShapeBasicCone2.prototype.constraints = null;

Graph.handleFactory[mxShapeBasicCone2.prototype.cst.CONE2] = function(state)
{
	var handles = [Graph.createHandle(state, ['dx'], function(bounds)
	{
		var dx = Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.state.style, 'dx', this.dx))));

		return new mxPoint(bounds.x + dx * bounds.width, bounds.y + 10);
	}, function(bounds, pt)
	{
		this.state.style['dx'] = Math.round(100 * Math.max(0, Math.min(1, (pt.x - bounds.x) / bounds.width))) / 100;
	})];

	var handle2 = Graph.createHandle(state, ['dy'], function(bounds)
	{
		var dy = Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.state.style, 'dy', this.dy))));

		return new mxPoint(bounds.x + 10, bounds.y + dy * bounds.height);
	}, function(bounds, pt)
	{
		this.state.style['dy'] = Math.round(100 * Math.max(0, Math.min(1, (pt.y - bounds.y) / bounds.height))) / 100;
	});
	
	handles.push(handle2);
	
	return handles;
};

mxShapeBasicCone2.prototype.getConstraints = function(style, w, h)
{
	var constr = [];
	var dx = w * Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));
	var dy = h * Math.max(0, Math.min(h, parseFloat(mxUtils.getValue(this.style, 'dy', this.dy))));
	var ry = h - dy;
	
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, dx, 0));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w, h - ry));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w * 0.5, h));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, 0, h - ry));

	return (constr);
}

//**********************************************************************************************************************************************************
//Pyramid
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicPyramid(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.dx1 = 0.5;
	this.dx2 = 0.6;
	this.dy1 = 0.9;
	this.dy2 = 0.8;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasicPyramid, mxActor);

mxShapeBasicPyramid.prototype.customProperties = [
	{name: 'dx1', dispName: 'Top', type: 'float', min:0, max:1, defVal:0.4},
	{name: 'dx2', dispName: 'Bottom', type: 'float', min:0, max:1, defVal:0.6},
	{name: 'dy1', dispName: 'Perspective Left', type: 'float', min:0, max:1, defVal:0.9},
	{name: 'dy2', dispName: 'Perspective Right', type: 'float', min:0, max:1, defVal:0.8}
];

mxShapeBasicPyramid.prototype.cst = {PYRAMID : 'mxgraph.basic.pyramid'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicPyramid.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	var dx1 = w * Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx1', this.dx1))));
	var dx2 = w * Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx2', this.dx2))));
	var dy1 = h * Math.max(0, Math.min(h, parseFloat(mxUtils.getValue(this.style, 'dy1', this.dy1))));
	var dy2 = h * Math.max(0, Math.min(h, parseFloat(mxUtils.getValue(this.style, 'dy2', this.dy2))));
	
	c.begin();
	c.moveTo(dx1, 0);
	c.lineTo(w, dy2);
	c.lineTo(dx2, h);
	c.lineTo(0, dy1);
	c.close();
	c.fillAndStroke();
	
	c.setShadow(false);
	
	c.begin();
	c.moveTo(dx1, 0);
	c.lineTo(dx2, h);
	c.stroke();
};

mxCellRenderer.registerShape(mxShapeBasicPyramid.prototype.cst.PYRAMID, mxShapeBasicPyramid);

mxShapeBasicPyramid.prototype.constraints = null;

Graph.handleFactory[mxShapeBasicPyramid.prototype.cst.PYRAMID] = function(state)
{
	var handles = [Graph.createHandle(state, ['dx1'], function(bounds)
	{
		var dx1 = Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.state.style, 'dx1', this.dx1))));

		return new mxPoint(bounds.x + dx1 * bounds.width, bounds.y + 10);
	}, function(bounds, pt)
	{
		this.state.style['dx1'] = Math.round(100 * Math.max(0, Math.min(1, (pt.x - bounds.x) / bounds.width))) / 100;
	})];

	var handle2 = Graph.createHandle(state, ['dx2'], function(bounds)
	{
		var dx2 = Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.state.style, 'dx2', this.dx2))));

		return new mxPoint(bounds.x + dx2 * bounds.width, bounds.y + bounds.height - 10);
	}, function(bounds, pt)
	{
		this.state.style['dx2'] = Math.round(100 * Math.max(0, Math.min(1, (pt.x - bounds.x) / bounds.width))) / 100;
	});
	
	handles.push(handle2);
	
	var handle3 = Graph.createHandle(state, ['dy1'], function(bounds)
	{
		var dy1 = Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.state.style, 'dy1', this.dy1))));

		return new mxPoint(bounds.x + 10, bounds.y + dy1 * bounds.height);
	}, function(bounds, pt)
	{
		this.state.style['dy1'] = Math.round(100 * Math.max(0, Math.min(1, (pt.y - bounds.y) / bounds.height))) / 100;
	});
	
	handles.push(handle3);
	
	var handle4 = Graph.createHandle(state, ['dy2'], function(bounds)
	{
		var dy2 = Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.state.style, 'dy2', this.dy2))));

		return new mxPoint(bounds.x + bounds.width - 10, bounds.y + dy2 * bounds.height);
	}, function(bounds, pt)
	{
		this.state.style['dy2'] = Math.round(100 * Math.max(0, Math.min(1, (pt.y - bounds.y) / bounds.height))) / 100;
	});
	
	handles.push(handle4);
	
	return handles;
};

mxShapeBasicPyramid.prototype.getConstraints = function(style, w, h)
{
	var constr = [];
	var dx1 = w * Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx1', this.dx1))));
	var dx2 = w * Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx2', this.dx2))));
	var dy1 = h * Math.max(0, Math.min(h, parseFloat(mxUtils.getValue(this.style, 'dy1', this.dy1))));
	var dy2 = h * Math.max(0, Math.min(h, parseFloat(mxUtils.getValue(this.style, 'dy2', this.dy2))));
	
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, dx1, 0));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, (w + dx1) * 0.5, dy2 * 0.5));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w, dy2));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, (w + dx2) * 0.5, (h + dy2) * 0.5));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, dx2, h));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, dx2 * 0.5, (h + dy1) * 0.5));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, 0, dy1));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, dx1 * 0.5, dy1 * 0.5));

	return (constr);
}

//**********************************************************************************************************************************************************
//4 Point Star 2
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasic4PointStar2(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.dx = 0.8;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasic4PointStar2, mxActor);

mxShapeBasic4PointStar2.prototype.customProperties = [
	{name: 'dx', dispName: 'Thickness', type: 'float', min:0, max:1, defVal:0.8}
];

mxShapeBasic4PointStar2.prototype.cst = {FOUR_POINT_STAR_2 : 'mxgraph.basic.4_point_star_2'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasic4PointStar2.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	var dx = 0.5 * Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));

	c.begin();
	c.moveTo(0, h * 0.5);
	c.lineTo(dx * w, dx * h);
	c.lineTo(w * 0.5, 0);
	c.lineTo(w - dx * w, dx * h);
	c.lineTo(w, h * 0.5);
	c.lineTo(w - dx * w, h - dx * h);
	c.lineTo(w * 0.5, h);
	c.lineTo(dx * w, h - dx * h);
	c.close();
	c.fillAndStroke();
};

mxCellRenderer.registerShape(mxShapeBasic4PointStar2.prototype.cst.FOUR_POINT_STAR_2, mxShapeBasic4PointStar2);

mxShapeBasic4PointStar2.prototype.constraints = null;

Graph.handleFactory[mxShapeBasic4PointStar2.prototype.cst.FOUR_POINT_STAR_2] = function(state)
{
	var handles = [Graph.createHandle(state, ['dx'], function(bounds)
	{
		var dx = Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.state.style, 'dx', this.dx))));

		return new mxPoint(bounds.x + dx * bounds.width / 2, bounds.y + dx * bounds.height / 2);
	}, function(bounds, pt)
	{
		this.state.style['dx'] = Math.round(100 * Math.max(0, Math.min(1, 2 * (pt.x - bounds.x) / bounds.width))) / 100;
	})];

	return handles;
};

mxShapeBasic4PointStar2.prototype.getConstraints = function(style, w, h)
{
	var constr = [];
	var dx = 0.5 * Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));

	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 1), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0.5), false));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 0.5), false));
	constr.push(new mxConnectionConstraint(new mxPoint(dx, dx), false));
	constr.push(new mxConnectionConstraint(new mxPoint(1 - dx, dx), false));
	constr.push(new mxConnectionConstraint(new mxPoint(1 - dx, 1 - dx), false));
	constr.push(new mxConnectionConstraint(new mxPoint(dx, 1 - dx), false));

	return (constr);
}

//**********************************************************************************************************************************************************
//Diagonal Snip Rectangle
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicDiagSnipRect(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.dx = 0.5;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasicDiagSnipRect, mxActor);

mxShapeBasicDiagSnipRect.prototype.customProperties = [
	{name: 'dx', dispName: 'Snip', type: 'float', min:0, deVal:6},
];

mxShapeBasicDiagSnipRect.prototype.cst = {DIAG_SNIP_RECT : 'mxgraph.basic.diag_snip_rect'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicDiagSnipRect.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	var dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx)))) * 2;

	dx = Math.min(w * 0.5, h * 0.5, dx);
	
	c.begin();
	c.moveTo(dx, 0);
	c.lineTo(w, 0);
	c.lineTo(w, h - dx);
	c.lineTo(w - dx, h);
	c.lineTo(0, h);
	c.lineTo(0, dx);
	c.close();
	c.fillAndStroke();
};

mxCellRenderer.registerShape(mxShapeBasicDiagSnipRect.prototype.cst.DIAG_SNIP_RECT, mxShapeBasicDiagSnipRect);

mxShapeBasicDiagSnipRect.prototype.constraints = null;

Graph.handleFactory[mxShapeBasicDiagSnipRect.prototype.cst.DIAG_SNIP_RECT] = function(state)
{
	var handles = [Graph.createHandle(state, ['dx'], function(bounds)
	{
		var dx = Math.max(0, Math.min(bounds.width / 4, bounds.width / 4, parseFloat(mxUtils.getValue(this.state.style, 'dx', this.dx))));

		return new mxPoint(bounds.x + dx, bounds.y + dx);
	}, function(bounds, pt)
	{
		this.state.style['dx'] = Math.round(100 * Math.max(0, Math.min(bounds.height / 4, bounds.width / 4, pt.x - bounds.x))) / 100;
	})];
			
	return handles;
};

mxShapeBasicDiagSnipRect.prototype.getConstraints = function(style, w, h)
{
	var constr = [];
	var dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx)))) * 2;

	dx = Math.min(w * 0.5, h * 0.5, dx) * 0.5;

	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, dx, dx));
	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 0.5), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w - dx, h - dx));
	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 1), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 1), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0.5), false));

	return (constr);
}

//**********************************************************************************************************************************************************
//Diagonal Round Rectangle
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicDiagRoundRect(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.dx = 0.5;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasicDiagRoundRect, mxActor);

mxShapeBasicDiagRoundRect.prototype.customProperties = [
	{name: 'dx', dispName: 'Rounding Size', type: 'float', min:0, defVal:6},
];

mxShapeBasicDiagRoundRect.prototype.cst = {DIAG_ROUND_RECT : 'mxgraph.basic.diag_round_rect'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicDiagRoundRect.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	var dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx)))) * 2;

	dx = Math.min(w * 0.5, h * 0.5, dx);
	
	c.begin();
	c.moveTo(dx, 0);
	c.lineTo(w, 0);
	c.lineTo(w, h - dx);
	c.arcTo(dx, dx, 0, 0, 1, w - dx, h);
	c.lineTo(0, h);
	c.lineTo(0, dx);
	c.arcTo(dx, dx, 0, 0, 1, dx, 0);
	c.close();
	c.fillAndStroke();
};

mxCellRenderer.registerShape(mxShapeBasicDiagRoundRect.prototype.cst.DIAG_ROUND_RECT, mxShapeBasicDiagRoundRect);

mxShapeBasicDiagRoundRect.prototype.constraints = null;

Graph.handleFactory[mxShapeBasicDiagRoundRect.prototype.cst.DIAG_ROUND_RECT] = function(state)
{
	var handles = [Graph.createHandle(state, ['dx'], function(bounds)
	{
		var dx = Math.max(0, Math.min(bounds.width / 4, bounds.width / 4, parseFloat(mxUtils.getValue(this.state.style, 'dx', this.dx))));

		return new mxPoint(bounds.x + dx, bounds.y + dx);
	}, function(bounds, pt)
	{
		this.state.style['dx'] = Math.round(100 * Math.max(0, Math.min(bounds.height / 4, bounds.width / 4, pt.x - bounds.x))) / 100;
	})];
			
	return handles;
};

mxShapeBasicDiagRoundRect.prototype.getConstraints = function(style, w, h)
{
	var constr = [];

	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 0.5), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 1), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 1), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0.5), false));

	return (constr);
}

//**********************************************************************************************************************************************************
//Corner Round Rectangle
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicCornerRoundRect(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.dx = 0.5;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasicCornerRoundRect, mxActor);

mxShapeBasicCornerRoundRect.prototype.customProperties = [
	{name: 'dx', dispName: 'Rounding Size', type: 'float', min:0, defVal:6},
];

mxShapeBasicCornerRoundRect.prototype.cst = {CORNER_ROUND_RECT : 'mxgraph.basic.corner_round_rect'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicCornerRoundRect.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	var dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx)))) * 2;

	dx = Math.min(w * 0.5, h * 0.5, dx);
	
	c.begin();
	c.moveTo(dx, 0);
	c.lineTo(w, 0);
	c.lineTo(w, h);
	c.lineTo(0, h);
	c.lineTo(0, dx);
	c.arcTo(dx, dx, 0, 0, 1, dx, 0);
	c.close();
	c.fillAndStroke();
};

mxCellRenderer.registerShape(mxShapeBasicCornerRoundRect.prototype.cst.CORNER_ROUND_RECT, mxShapeBasicCornerRoundRect);

mxShapeBasicCornerRoundRect.prototype.constraints = null;

Graph.handleFactory[mxShapeBasicCornerRoundRect.prototype.cst.CORNER_ROUND_RECT] = function(state)
{
	var handles = [Graph.createHandle(state, ['dx'], function(bounds)
	{
		var dx = Math.max(0, Math.min(bounds.width / 4, bounds.width / 4, parseFloat(mxUtils.getValue(this.state.style, 'dx', this.dx))));

		return new mxPoint(bounds.x + dx, bounds.y + dx);
	}, function(bounds, pt)
	{
		this.state.style['dx'] = Math.round(100 * Math.max(0, Math.min(bounds.height / 4, bounds.width / 4, pt.x - bounds.x))) / 100;
	})];
			
	return handles;
};

mxShapeBasicCornerRoundRect.prototype.getConstraints = function(style, w, h)
{
	var constr = [];

	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 0.5), false));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 1), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 1), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 1), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0.5), false));

	return (constr);
}

//**********************************************************************************************************************************************************
//Plaque
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicPlaque(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.dx = 0.5;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasicPlaque, mxActor);

mxShapeBasicPlaque.prototype.customProperties = [
	{name: 'dx', dispName: 'Cutoff Size', type: 'float', min:0, defVal:6},
];

mxShapeBasicPlaque.prototype.cst = {PLAQUE : 'mxgraph.basic.plaque'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicPlaque.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	var dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx)))) * 2;

	dx = Math.min(w * 0.5, h * 0.5, dx);
	
	c.begin();
	c.moveTo(w - dx, 0);
	c.arcTo(dx, dx, 0, 0, 0, w, dx);
	c.lineTo(w, h - dx);
	c.arcTo(dx, dx, 0, 0, 0, w - dx, h);
	c.lineTo(dx, h);
	c.arcTo(dx, dx, 0, 0, 0, 0, h - dx);
	c.lineTo(0, dx);
	c.arcTo(dx, dx, 0, 0, 0, dx, 0);
	c.close();
	c.fillAndStroke();
};

mxCellRenderer.registerShape(mxShapeBasicPlaque.prototype.cst.PLAQUE, mxShapeBasicPlaque);

mxShapeBasicPlaque.prototype.constraints = null;

Graph.handleFactory[mxShapeBasicPlaque.prototype.cst.PLAQUE] = function(state)
{
	var handles = [Graph.createHandle(state, ['dx'], function(bounds)
	{
		var dx = Math.max(0, Math.min(bounds.width / 4, bounds.width / 4, parseFloat(mxUtils.getValue(this.state.style, 'dx', this.dx))));

		return new mxPoint(bounds.x + dx * 1.41, bounds.y + dx * 1.41);
	}, function(bounds, pt)
	{
		this.state.style['dx'] = Math.round(100 * Math.max(0, Math.min(bounds.height / 4, bounds.width / 4, pt.x - bounds.x))) / 100;
	})];
			
	return handles;
};

mxShapeBasicPlaque.prototype.getConstraints = function(style, w, h)
{
	var constr = [];

	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 0.5), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 1), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0.5), false));

	return (constr);
}

//**********************************************************************************************************************************************************
//Frame
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicFrame(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.dx = 0.5;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasicFrame, mxActor);

mxShapeBasicFrame.prototype.customProperties = [
	{name: 'dx', dispName: 'Width', type: 'float', min:0, defVal:10},
];

mxShapeBasicFrame.prototype.cst = {FRAME : 'mxgraph.basic.frame'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicFrame.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	var dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));

	dx = Math.min(w * 0.5, h * 0.5, dx);
	
	c.begin();
	c.moveTo(w, 0);
	c.lineTo(w, h);
	c.lineTo(0, h);
	c.lineTo(0, 0);
	c.close();
	c.moveTo(dx, dx);
	c.lineTo(dx, h - dx);
	c.lineTo(w - dx, h - dx);
	c.lineTo(w - dx, dx);
	c.close();
	c.fillAndStroke();
};

mxCellRenderer.registerShape(mxShapeBasicFrame.prototype.cst.FRAME, mxShapeBasicFrame);

mxShapeBasicFrame.prototype.constraints = null;

Graph.handleFactory[mxShapeBasicFrame.prototype.cst.FRAME] = function(state)
{
	var handles = [Graph.createHandle(state, ['dx'], function(bounds)
	{
		var dx = Math.max(0, Math.min(bounds.width / 2, bounds.width / 2, parseFloat(mxUtils.getValue(this.state.style, 'dx', this.dx))));

		return new mxPoint(bounds.x + dx, bounds.y + dx);
	}, function(bounds, pt)
	{
		this.state.style['dx'] = Math.round(100 * Math.max(0, Math.min(bounds.height / 2, bounds.width / 2, pt.x - bounds.x))) / 100;
	})];
			
	return handles;
};

mxShapeBasicFrame.prototype.getConstraints = function(style, w, h)
{
	var constr = [];
	var dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));
	dx = Math.min(w * 0.5, h * 0.5, dx);

	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w * 0.25, 0));
	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w * 0.75, 0));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w, h * 0.25));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 0.5), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w, h * 0.75));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 1), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w * 0.75, h));
	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 1), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w * 0.25, h));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 1), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, 0, h * 0.75));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0.5), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, 0, h * 0.25));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, dx, dx));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, (w - 2 * dx)* 0.25 + dx, dx));
	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 0), false, null, 0, dx));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, (w * 1.5 - dx) * 0.5, dx));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 0), false, null, -dx, dx));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w - dx, (h - 2 * dx)* 0.25 + dx));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 0.5), false, null, -dx, 0));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w - dx, (h  - 2 * dx) * 0.75 + dx));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 1), false, null, -dx, -dx));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, (w - 2 * dx) * 0.75 + dx, h - dx));
	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 1), false, null, 0, -dx));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, (w  - 2 * dx) * 0.25 + dx, h - dx));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 1), false, null, dx, -dx));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, dx, (h - 2 * dx) * 0.75 + dx));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0.5), false, null, dx, 0));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, dx, (h - 2 * dx) * 0.25 + dx));

	return (constr);
}

//**********************************************************************************************************************************************************
//Plaque Frame
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicPlaqueFrame(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.dx = 0.5;
};

/**
*/
mxUtils.extend(mxShapeBasicPlaqueFrame, mxActor);

mxShapeBasicPlaqueFrame.prototype.customProperties = [
	{name: 'dx', dispName: 'Width', type: 'float', mix:0, defVal:10},
];

mxShapeBasicPlaqueFrame.prototype.cst = {PLAQUE_FRAME : 'mxgraph.basic.plaque_frame'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicPlaqueFrame.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	var dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));

	dx = Math.min(w * 0.25, h * 0.25, dx);
	
	c.begin();
	c.moveTo(w - dx, 0);
	c.arcTo(dx, dx, 0, 0, 0, w, dx);
	c.lineTo(w, h - dx);
	c.arcTo(dx, dx, 0, 0, 0, w - dx, h);
	c.lineTo(dx, h);
	c.arcTo(dx, dx, 0, 0, 0, 0, h - dx);
	c.lineTo(0, dx);
	c.arcTo(dx, dx, 0, 0, 0, dx, 0);
	c.close();
	
	c.moveTo(dx * 2, dx);
	c.arcTo(dx * 2, dx * 2, 0, 0, 1, dx, dx * 2);
	c.lineTo(dx, h - 2 * dx);
	c.arcTo(dx * 2, dx * 2, 0, 0, 1, dx * 2, h - dx);
	c.lineTo(w - 2 * dx, h - dx);
	c.arcTo(dx * 2, dx * 2, 0, 0, 1, w - dx, h - 2 * dx);
	c.lineTo(w - dx, dx * 2);
	c.arcTo(dx * 2, dx * 2, 0, 0, 1, w - 2 * dx, dx);
	c.close();

	c.fillAndStroke();

};

mxCellRenderer.registerShape(mxShapeBasicPlaqueFrame.prototype.cst.PLAQUE_FRAME, mxShapeBasicPlaqueFrame);

mxShapeBasicPlaqueFrame.prototype.constraints = null;

Graph.handleFactory[mxShapeBasicPlaqueFrame.prototype.cst.PLAQUE_FRAME] = function(state)
{
	var handles = [Graph.createHandle(state, ['dx'], function(bounds)
	{
		var dx = Math.max(0, Math.min(bounds.width / 4, bounds.width / 4, parseFloat(mxUtils.getValue(this.state.style, 'dx', this.dx))));

		return new mxPoint(bounds.x + dx, bounds.y + dx);
	}, function(bounds, pt)
	{
		this.state.style['dx'] = Math.round(100 * Math.max(0, Math.min(bounds.height / 4, bounds.width / 4, pt.x - bounds.x))) / 100;
	})];
			
	return handles;
};

mxShapeBasicPlaqueFrame.prototype.getConstraints = function(style, w, h)
{
	var constr = [];
	var dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));
	dx = Math.min(w * 0.5, h * 0.5, dx);

	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 0.5), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 1), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0.5), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 0), false, null, 0, dx));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 0.5), false, null, -dx, 0));
	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 1), false, null, 0, -dx));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0.5), false, null, dx, 0));

	return (constr);
}

//**********************************************************************************************************************************************************
//Rounded Frame
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicRoundedFrame(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.dx = 0.5;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasicRoundedFrame, mxActor);

mxShapeBasicRoundedFrame.prototype.customProperties = [
	{name: 'dx', dispName: 'Width', type: 'float', min:0, defVal:10},
];

mxShapeBasicRoundedFrame.prototype.cst = {ROUNDED_FRAME : 'mxgraph.basic.rounded_frame'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicRoundedFrame.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	var dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));

	dx = Math.min(w * 0.25, h * 0.25, dx);
	
	c.begin();
	c.moveTo(w - 2 * dx, 0);
	c.arcTo(dx * 2, dx * 2, 0, 0, 1, w, 2 * dx);
	c.lineTo(w, h - 2 * dx);
	c.arcTo(dx * 2, dx * 2, 0, 0, 1, w - 2 * dx, h);
	c.lineTo(dx * 2, h);
	c.arcTo(dx * 2, dx * 2, 0, 0, 1, 0, h - 2 * dx);
	c.lineTo(0, 2 * dx);
	c.arcTo(dx * 2, dx * 2, 0, 0, 1, 2 * dx, 0);
	c.close();
	
	c.moveTo(dx * 2, dx);
	c.arcTo(dx, dx, 0, 0, 0, dx, dx * 2);
	c.lineTo(dx, h - 2 * dx);
	c.arcTo(dx, dx, 0, 0, 0, dx * 2, h - dx);
	c.lineTo(w - 2 * dx, h - dx);
	c.arcTo(dx, dx, 0, 0, 0, w - dx, h - 2 * dx);
	c.lineTo(w - dx, dx * 2);
	c.arcTo(dx, dx, 0, 0, 0, w - 2 * dx, dx);
	c.close();

	c.fillAndStroke();

};

mxCellRenderer.registerShape(mxShapeBasicRoundedFrame.prototype.cst.ROUNDED_FRAME, mxShapeBasicRoundedFrame);

mxShapeBasicRoundedFrame.prototype.constraints = null;

Graph.handleFactory[mxShapeBasicRoundedFrame.prototype.cst.ROUNDED_FRAME] = function(state)
{
	var handles = [Graph.createHandle(state, ['dx'], function(bounds)
	{
		var dx = Math.max(0, Math.min(bounds.width / 4, bounds.width / 4, parseFloat(mxUtils.getValue(this.state.style, 'dx', this.dx))));

		return new mxPoint(bounds.x + dx, bounds.y + dx);
	}, function(bounds, pt)
	{
		this.state.style['dx'] = Math.round(100 * Math.max(0, Math.min(bounds.height / 4, bounds.width / 4, pt.x - bounds.x))) / 100;
	})];
			
	return handles;
};

mxShapeBasicRoundedFrame.prototype.getConstraints = function(style, w, h)
{
	var constr = [];
	var dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));
	dx = Math.min(w * 0.5, h * 0.5, dx);

	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 0.5), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 1), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0.5), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 0), false, null, 0, dx));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 0.5), false, null, -dx, 0));
	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 1), false, null, 0, -dx));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0.5), false, null, dx, 0));

	return (constr);
}

//**********************************************************************************************************************************************************
//Frame Corner
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicFrameCorner(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.dx = 0.5;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasicFrameCorner, mxActor);

mxShapeBasicFrameCorner.prototype.customProperties = [
	{name: 'dx', dispName: 'Width', type: 'float', min:0, defVal:10},
];

mxShapeBasicFrameCorner.prototype.cst = {FRAME_CORNER : 'mxgraph.basic.frame_corner'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicFrameCorner.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	var dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));

	dx = Math.min(w * 0.5, h * 0.5, dx);
	
	c.begin();
	c.moveTo(0, 0);
	c.lineTo(w, 0);
	c.lineTo(w - dx, dx);
	c.lineTo(dx, dx);
	c.lineTo(dx, h - dx);
	c.lineTo(0, h);
	c.close();
	c.fillAndStroke();
};

mxCellRenderer.registerShape(mxShapeBasicFrameCorner.prototype.cst.FRAME_CORNER, mxShapeBasicFrameCorner);

mxShapeBasicFrameCorner.prototype.constraints = null;

Graph.handleFactory[mxShapeBasicFrameCorner.prototype.cst.FRAME_CORNER] = function(state)
{
	var handles = [Graph.createHandle(state, ['dx'], function(bounds)
	{
		var dx = Math.max(0, Math.min(bounds.width / 2, bounds.width / 2, parseFloat(mxUtils.getValue(this.state.style, 'dx', this.dx))));

		return new mxPoint(bounds.x + dx, bounds.y + dx);
	}, function(bounds, pt)
	{
		this.state.style['dx'] = Math.round(100 * Math.max(0, Math.min(bounds.height / 2, bounds.width / 2, pt.x - bounds.x))) / 100;
	})];
			
	return handles;
};

mxShapeBasicFrameCorner.prototype.getConstraints = function(style, w, h)
{
	var constr = [];
	var dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));

	dx = Math.min(w * 0.5, h * 0.5, dx);
	
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 0), false, null, -dx, dx));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, (w - 2 * dx) * 0.5 + dx, dx));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, dx, dx));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, dx, (h - 2 * dx) * 0.5 + dx));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 1), false, null, dx, -dx));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 1), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0.5), false));

	return (constr);
}

//**********************************************************************************************************************************************************
//Diagonal Stripe
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicDiagStripe(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.dx = 0.5;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasicDiagStripe, mxActor);

mxShapeBasicDiagStripe.prototype.customProperties = [
	{name: 'dx', dispName: 'Width', type: 'float', mix:0, defVal:10},
];

mxShapeBasicDiagStripe.prototype.cst = {DIAG_STRIPE : 'mxgraph.basic.diag_stripe'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicDiagStripe.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	var dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));

	dx = Math.min(w, h, dx);
	
	c.begin();
	c.moveTo(0, h);
	c.lineTo(w, 0);
	c.lineTo(w, Math.min(dx * 100 / w, h));
	c.lineTo(Math.min(dx * 100 / h, w), h);
	c.close();
	c.fillAndStroke();
};

mxCellRenderer.registerShape(mxShapeBasicDiagStripe.prototype.cst.DIAG_STRIPE, mxShapeBasicDiagStripe);

mxShapeBasicDiagStripe.prototype.constraints = null;

Graph.handleFactory[mxShapeBasicDiagStripe.prototype.cst.DIAG_STRIPE] = function(state)
{
	var handles = [Graph.createHandle(state, ['dx'], function(bounds)
	{
		var dx = Math.max(0, Math.min(bounds.width / 2, parseFloat(mxUtils.getValue(this.state.style, 'dx', this.dx))));

		return new mxPoint(bounds.x + dx, bounds.y + bounds.height);
	}, function(bounds, pt)
	{
		this.state.style['dx'] = Math.round(100 * Math.max(0, Math.min(bounds.height / 2, bounds.width / 2, pt.x - bounds.x))) / 100;
	})];
			
	return handles;
};

mxShapeBasicDiagStripe.prototype.getConstraints = function(style, w, h)
{
	var constr = [];
	var dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));
	dx = Math.min(w, h, dx);
	
	constr.push(new mxConnectionConstraint(new mxPoint(0, 1), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 0.5), false));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w, Math.min(dx * 100 / w, h) * 0.5));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w, Math.min(dx * 100 / w, h)));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, (w + Math.min(dx * 100 / h, w)) * 0.5, (Math.min(dx * 100 / w, h) + h) * 0.5));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, Math.min(dx * 100 / h, w), h));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, Math.min(dx * 100 / h, w) * 0.5, h));

	return (constr);
}

//**********************************************************************************************************************************************************
//Donut
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicDonut(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.dx = 0.5;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasicDonut, mxActor);

mxShapeBasicDonut.prototype.customProperties = [
	{name: 'dx', dispName: 'Width', type: 'float', min:0, defVal:25}
];

mxShapeBasicDonut.prototype.cst = {DONUT : 'mxgraph.basic.donut'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicDonut.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	var dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));

	dx = Math.min(w * 0.5, h * 0.5, dx);
	
	c.begin();
	c.moveTo(0, h * 0.5);
	c.arcTo(w * 0.5, h * 0.5, 0, 0, 1, w * 0.5, 0);
	c.arcTo(w * 0.5, h * 0.5, 0, 0, 1, w, h * 0.5);
	c.arcTo(w * 0.5, h * 0.5, 0, 0, 1, w * 0.5, h);
	c.arcTo(w * 0.5, h * 0.5, 0, 0, 1, 0, h * 0.5);
	c.close();
	c.moveTo(w * 0.5, dx);
	c.arcTo(w * 0.5 - dx, h * 0.5 - dx, 0, 0, 0, dx, h * 0.5);
	c.arcTo(w * 0.5 - dx, h * 0.5 - dx, 0, 0, 0, w * 0.5, h - dx);
	c.arcTo(w * 0.5 - dx, h * 0.5 - dx, 0, 0, 0, w - dx, h * 0.5);
	c.arcTo(w * 0.5 - dx, h * 0.5 - dx, 0, 0, 0, w * 0.5, dx);
	c.close();
	c.fillAndStroke();
};

mxCellRenderer.registerShape(mxShapeBasicDonut.prototype.cst.DONUT, mxShapeBasicDonut);

mxShapeBasicDonut.prototype.constraints = null;

Graph.handleFactory[mxShapeBasicDonut.prototype.cst.DONUT] = function(state)
{
	var handles = [Graph.createHandle(state, ['dx'], function(bounds)
	{
		var dx = Math.max(0, Math.min(bounds.width / 2, bounds.width / 2, parseFloat(mxUtils.getValue(this.state.style, 'dx', this.dx))));

		return new mxPoint(bounds.x + dx, bounds.y + bounds.height / 2);
	}, function(bounds, pt)
	{
		this.state.style['dx'] = Math.round(100 * Math.max(0, Math.min(bounds.height / 2, bounds.width / 2, pt.x - bounds.x))) / 100;
	})];
			
	return handles;
};

//**********************************************************************************************************************************************************
//Layered Rect
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicLayeredRect(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.dx = 0.5;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasicLayeredRect, mxActor);

mxShapeBasicLayeredRect.prototype.customProperties = [
	{name: 'dx', dispName: 'Layer Distance', type: 'float', mix:0, defVal:10}
];

mxShapeBasicLayeredRect.prototype.cst = {LAYERED_RECT : 'mxgraph.basic.layered_rect'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicLayeredRect.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	var dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));

	dx = Math.min(w * 0.5, h * 0.5, dx);
	
	c.begin();
	c.moveTo(dx, dx);
	c.lineTo(w, dx);
	c.lineTo(w, h);
	c.lineTo(dx, h);
	c.close();
	c.fillAndStroke();
	
	c.begin();
	c.moveTo(dx * 0.5, dx * 0.5);
	c.lineTo(w - dx * 0.5, dx * 0.5);
	c.lineTo(w - dx * 0.5, h - dx * 0.5);
	c.lineTo(dx * 0.5, h - dx * 0.5);
	c.close();
	c.fillAndStroke();
	
	c.begin();
	c.moveTo(0, 0);
	c.lineTo(w - dx, 0);
	c.lineTo(w - dx, h - dx);
	c.lineTo(0, h - dx);
	c.close();
	c.fillAndStroke();
};

mxCellRenderer.registerShape(mxShapeBasicLayeredRect.prototype.cst.LAYERED_RECT, mxShapeBasicLayeredRect);

mxShapeBasicLayeredRect.prototype.constraints = null;

Graph.handleFactory[mxShapeBasicLayeredRect.prototype.cst.LAYERED_RECT] = function(state)
{
	var handles = [Graph.createHandle(state, ['dx'], function(bounds)
	{
		var dx = Math.max(0, Math.min(bounds.width / 2, bounds.width / 2, parseFloat(mxUtils.getValue(this.state.style, 'dx', this.dx))));

		return new mxPoint(bounds.x + bounds.width - dx, bounds.y + bounds.height - dx);
	}, function(bounds, pt)
	{
		this.state.style['dx'] = Math.round(100 * Math.max(0, Math.min(bounds.height / 2, bounds.width / 2, - pt.x + bounds.width + bounds.x))) / 100;
	})];
			
	return handles;
};

mxShapeBasicLayeredRect.prototype.getConstraints = function(style, w, h)
{
	var constr = [];
	var dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));
	dx = Math.min(w * 0.5, h * 0.5, dx);
	
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, (w - dx) * 0.25, 0));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, (w - dx) * 0.5, 0));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, (w - dx) * 0.75, 0));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w - dx, 0));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w - dx * 0.5, dx * 0.5));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w, dx));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w, (h - dx) * 0.25 + dx));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w, (h - dx) * 0.5 + dx));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w, (h - dx) * 0.75 + dx));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, w, h));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, (w - dx) * 0.75 + dx, h));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, (w - dx) * 0.5 + dx, h));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, (w - dx) * 0.25 + dx, h));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, dx, h));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, dx * 0.5, h - dx * 0.5));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, 0, h - dx));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, 0, (h - dx) * 0.75));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, 0, (h - dx) * 0.5));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, 0, (h - dx) * 0.25));

	return (constr);
}

//**********************************************************************************************************************************************************
//Button
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicButton(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.dx = 0.5;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasicButton, mxActor);

mxShapeBasicButton.prototype.customProperties = [
	{name: 'dx', dispName: 'Button Height', type: 'float', min:0, defVal:10}
];

mxShapeBasicButton.prototype.cst = {BUTTON : 'mxgraph.basic.button'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicButton.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	var dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));

	dx = Math.min(w * 0.5, h * 0.5, dx);
	
	c.begin();
	c.moveTo(0, 0);
	c.lineTo(w, 0);
	c.lineTo(w, h);
	c.lineTo(0, h);
	c.close();
	c.fillAndStroke();
	
	c.setShadow(false);
	c.setLineJoin('round');
	
	c.begin();
	c.moveTo(0, h);
	c.lineTo(0, 0);
	c.lineTo(dx, dx);
	c.lineTo(dx, h - dx);
	c.close();
	c.fillAndStroke();
	
	c.begin();
	c.moveTo(0, 0);
	c.lineTo(w, 0);
	c.lineTo(w - dx, dx);
	c.lineTo(dx, dx);
	c.close();
	c.fillAndStroke();
	
	c.begin();
	c.moveTo(w, 0);
	c.lineTo(w, h);
	c.lineTo(w - dx, h - dx);
	c.lineTo(w - dx, dx);
	c.close();
	c.fillAndStroke();
	
	c.begin();
	c.moveTo(0, h);
	c.lineTo(dx, h - dx);
	c.lineTo(w - dx, h - dx);
	c.lineTo(w, h);
	c.close();
	c.fillAndStroke();
	
	c.begin();
	c.moveTo(0, h);
	c.lineTo(0, 0);
	c.lineTo(dx, dx);
	c.lineTo(dx, h - dx);
	c.close();
	c.fillAndStroke();
	
	
};

mxCellRenderer.registerShape(mxShapeBasicButton.prototype.cst.BUTTON, mxShapeBasicButton);

mxShapeBasicButton.prototype.constraints = null;

Graph.handleFactory[mxShapeBasicButton.prototype.cst.BUTTON] = function(state)
{
	var handles = [Graph.createHandle(state, ['dx'], function(bounds)
	{
		var dx = Math.max(0, Math.min(bounds.width / 2, bounds.width / 2, parseFloat(mxUtils.getValue(this.state.style, 'dx', this.dx))));

		return new mxPoint(bounds.x + dx, bounds.y + dx);
	}, function(bounds, pt)
	{
		this.state.style['dx'] = Math.round(100 * Math.max(0, Math.min(bounds.height / 2, bounds.width / 2, pt.x - bounds.x))) / 100;
	})];
			
	return handles;
};

//**********************************************************************************************************************************************************
//Shaded Button
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicShadedButton(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.dx = 0.5;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasicShadedButton, mxActor);

mxShapeBasicShadedButton.prototype.customProperties = [
	{name: 'dx', dispName: 'Button Height', type: 'float', min:0, defVal:10}
];

mxShapeBasicShadedButton.prototype.cst = {SHADED_BUTTON : 'mxgraph.basic.shaded_button'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicShadedButton.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);
	
	c.setShadow(false);

	var dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx))));

	dx = Math.min(w * 0.5, h * 0.5, dx);
	
	c.begin();
	c.moveTo(0, 0);
	c.lineTo(w, 0);
	c.lineTo(w, h);
	c.lineTo(0, h);
	c.close();
	c.fill();
	
	c.setFillColor('#ffffff');
	c.setAlpha(0.25);
	c.begin();
	c.moveTo(0, h);
	c.lineTo(0, 0);
	c.lineTo(dx, dx);
	c.lineTo(dx, h - dx);
	c.close();
	c.fill();
	
	c.setAlpha(0.5);
	c.begin();
	c.moveTo(0, 0);
	c.lineTo(w, 0);
	c.lineTo(w - dx, dx);
	c.lineTo(dx, dx);
	c.close();
	c.fill();
	
	c.setFillColor('#000000');
	c.setAlpha(0.25);
	c.begin();
	c.moveTo(w, 0);
	c.lineTo(w, h);
	c.lineTo(w - dx, h - dx);
	c.lineTo(w - dx, dx);
	c.close();
	c.fill();
	
	c.setAlpha(0.5);
	c.begin();
	c.moveTo(0, h);
	c.lineTo(dx, h - dx);
	c.lineTo(w - dx, h - dx);
	c.lineTo(w, h);
	c.close();
	c.fill();
	
	
};

mxCellRenderer.registerShape(mxShapeBasicShadedButton.prototype.cst.SHADED_BUTTON, mxShapeBasicShadedButton);

mxShapeBasicShadedButton.prototype.constraints = null;

Graph.handleFactory[mxShapeBasicShadedButton.prototype.cst.SHADED_BUTTON] = function(state)
{
	var handles = [Graph.createHandle(state, ['dx'], function(bounds)
	{
		var dx = Math.max(0, Math.min(bounds.width / 2, bounds.width / 2, parseFloat(mxUtils.getValue(this.state.style, 'dx', this.dx))));

		return new mxPoint(bounds.x + dx, bounds.y + dx);
	}, function(bounds, pt)
	{
		this.state.style['dx'] = Math.round(100 * Math.max(0, Math.min(bounds.height / 2, bounds.width / 2, pt.x - bounds.x))) / 100;
	})];
			
	return handles;
};

//**********************************************************************************************************************************************************
//Pie
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicPie(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.startAngle = 0.25;
	this.endAngle = 0.75;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasicPie, mxActor);

mxShapeBasicPie.prototype.customProperties = [
	{name: 'startAngle', dispName: 'Start Angle', type: 'float', min:0, max:1, defVal: 0.2},
	{name: 'endAngle', dispName: 'End Angle', type: 'float', min:0, max:1, defVal: 0.9}
];

mxShapeBasicPie.prototype.cst = {PIE : 'mxgraph.basic.pie'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicPie.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);
	var startAngleSource = Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.style, 'startAngle', this.startAngle))));
	var endAngleSource = Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.style, 'endAngle', this.endAngle))));
	var startAngle = 2 * Math.PI * startAngleSource;
	var endAngle = 2 * Math.PI * endAngleSource;
	var rx = w * 0.5;
	var ry = h * 0.5;
	
	var startX = rx + Math.sin(startAngle) * rx;
	var startY = ry - Math.cos(startAngle) * ry;
	var endX = rx + Math.sin(endAngle) * rx;
	var endY = ry - Math.cos(endAngle) * ry;
	
	var angDiff = endAngle - startAngle;
	
	if (angDiff < 0)
	{
		angDiff = angDiff + Math.PI * 2;
	}
		
	var bigArc = 0;
	
	if (angDiff >= Math.PI)
	{
		bigArc = 1;
	}
		
	c.begin();
	var startAngleDiff = startAngleSource % 1;
	var endAngleDiff = endAngleSource % 1;
	
	if (startAngleDiff == 0 && endAngleDiff == 0.5)
	{
		c.moveTo(rx, ry);
		c.lineTo(startX, startY);
		c.arcTo(rx, ry, 0, 0, 1, w, h * 0.5);
		c.arcTo(rx, ry, 0, 0, 1, w * 0.5, h);
	}
	else if (startAngleDiff == 0.5 && endAngleDiff == 0)
	{
		c.moveTo(rx, ry);
		c.lineTo(startX, startY);
		c.arcTo(rx, ry, 0, 0, 1, 0, h * 0.5);
		c.arcTo(rx, ry, 0, 0, 1, w * 0.5, 0);
	}
	else
	{
		c.moveTo(rx, ry);
		c.lineTo(startX, startY);
		c.arcTo(rx, ry, 0, bigArc, 1, endX, endY);
	}
	
	c.close();
	c.fillAndStroke();
};

mxCellRenderer.registerShape(mxShapeBasicPie.prototype.cst.PIE, mxShapeBasicPie);

mxShapeBasicPie.prototype.constraints = null;

Graph.handleFactory[mxShapeBasicPie.prototype.cst.PIE] = function(state)
{
	var handles = [Graph.createHandle(state, ['startAngle'], function(bounds)
	{
		var startAngle = 2 * Math.PI * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.state.style, 'startAngle', this.startAngle))));

		return new mxPoint(bounds.x + bounds.width * 0.5 + Math.sin(startAngle) * bounds.width * 0.5, bounds.y + bounds.height * 0.5 - Math.cos(startAngle) * bounds.height * 0.5);
	}, function(bounds, pt)
	{
		var handleX = Math.round(100 * Math.max(-1, Math.min(1, (pt.x - bounds.x - bounds.width * 0.5) / (bounds.width * 0.5)))) / 100;
		var handleY = -Math.round(100 * Math.max(-1, Math.min(1, (pt.y - bounds.y - bounds.height * 0.5) / (bounds.height * 0.5)))) / 100;
		
		var res =  0.5 * Math.atan2(handleX, handleY) / Math.PI;
		
		if (res < 0)
		{
			res = 1 + res;
		}

		this.state.style['startAngle'] = res;
		
	})];

	var handle2 = Graph.createHandle(state, ['endAngle'], function(bounds)
	{
		var endAngle = 2 * Math.PI * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.state.style, 'endAngle', this.endAngle))));

		return new mxPoint(bounds.x + bounds.width * 0.5 + Math.sin(endAngle) * bounds.width * 0.5, bounds.y + bounds.height * 0.5 - Math.cos(endAngle) * bounds.height * 0.5);
	}, function(bounds, pt)
	{
		var handleX = Math.round(100 * Math.max(-1, Math.min(1, (pt.x - bounds.x - bounds.width * 0.5) / (bounds.width * 0.5)))) / 100;
		var handleY = -Math.round(100 * Math.max(-1, Math.min(1, (pt.y - bounds.y - bounds.height * 0.5) / (bounds.height * 0.5)))) / 100;
		
		var res =  0.5 * Math.atan2(handleX, handleY) / Math.PI;
		
		if (res < 0)
		{
			res = 1 + res;
		}
		
		this.state.style['endAngle'] = res;
	});
	
	handles.push(handle2);
	
	return handles;
};

//**********************************************************************************************************************************************************
//Arc
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicArc(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.startAngle = 0.25;
	this.endAngle = 0.75;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasicArc, mxActor);

mxShapeBasicArc.prototype.customProperties = [
	{name: 'startAngle', dispName: 'Start Angle', type: 'float', min:0, max:1, defVal: 0.3},
	{name: 'endAngle', dispName: 'End Angle', type: 'float', min:0, max:1, defVal:0.1}
];

mxShapeBasicArc.prototype.cst = {ARC : 'mxgraph.basic.arc'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicArc.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	var startAngleSource = Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.style, 'startAngle', this.startAngle))));
	var endAngleSource = Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.style, 'endAngle', this.endAngle))));
	var startAngle = 2 * Math.PI * startAngleSource;
	var endAngle = 2 * Math.PI * endAngleSource;
	var rx = w * 0.5;
	var ry = h * 0.5;
	
	var startX = rx + Math.sin(startAngle) * rx;
	var startY = ry - Math.cos(startAngle) * ry;
	var endX = rx + Math.sin(endAngle) * rx;
	var endY = ry - Math.cos(endAngle) * ry;
	
	var angDiff = endAngle - startAngle;
	
	if (angDiff < 0)
	{
		angDiff = angDiff + Math.PI * 2;
	}
		
	var bigArc = 0;
	
	if (angDiff > Math.PI)
	{
		bigArc = 1;
	}
		
	c.begin();
	
	var startAngleDiff = startAngleSource % 1;
	var endAngleDiff = endAngleSource % 1;
	
	if (startAngleDiff == 0 && endAngleDiff == 0.5)
	{
		c.moveTo(startX, startY);
		c.arcTo(rx, ry, 0, 0, 1, w, h * 0.5);
		c.arcTo(rx, ry, 0, 0, 1, w * 0.5, h);
	}
	else if (startAngleDiff == 0.5 && endAngleDiff == 0)
	{
		c.moveTo(startX, startY);
		c.arcTo(rx, ry, 0, 0, 1, 0, h * 0.5);
		c.arcTo(rx, ry, 0, 0, 1, w * 0.5, 0);
	}
	else
	{
		c.moveTo(startX, startY);
		c.arcTo(rx, ry, 0, bigArc, 1, endX, endY);
	}

	c.stroke();
};

mxCellRenderer.registerShape(mxShapeBasicArc.prototype.cst.ARC, mxShapeBasicArc);

mxShapeBasicArc.prototype.constraints = null;

Graph.handleFactory[mxShapeBasicArc.prototype.cst.ARC] = function(state)
{
	var handles = [Graph.createHandle(state, ['startAngle'], function(bounds)
	{
		var startAngle = 2 * Math.PI * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.state.style, 'startAngle', this.startAngle))));

		return new mxPoint(bounds.x + bounds.width * 0.5 + Math.sin(startAngle) * bounds.width * 0.5, bounds.y + bounds.height * 0.5 - Math.cos(startAngle) * bounds.height * 0.5);
	}, function(bounds, pt)
	{
		var handleX = Math.round(100 * Math.max(-1, Math.min(1, (pt.x - bounds.x - bounds.width * 0.5) / (bounds.width * 0.5)))) / 100;
		var handleY = -Math.round(100 * Math.max(-1, Math.min(1, (pt.y - bounds.y - bounds.height * 0.5) / (bounds.height * 0.5)))) / 100;
		
		var res =  0.5 * Math.atan2(handleX, handleY) / Math.PI;
		
		if (res < 0)
		{
			res = 1 + res;
		}

		this.state.style['startAngle'] = res;
		
	})];

	var handle2 = Graph.createHandle(state, ['endAngle'], function(bounds)
	{
		var endAngle = 2 * Math.PI * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.state.style, 'endAngle', this.endAngle))));

		return new mxPoint(bounds.x + bounds.width * 0.5 + Math.sin(endAngle) * bounds.width * 0.5, bounds.y + bounds.height * 0.5 - Math.cos(endAngle) * bounds.height * 0.5);
	}, function(bounds, pt)
	{
		var handleX = Math.round(100 * Math.max(-1, Math.min(1, (pt.x - bounds.x - bounds.width * 0.5) / (bounds.width * 0.5)))) / 100;
		var handleY = -Math.round(100 * Math.max(-1, Math.min(1, (pt.y - bounds.y - bounds.height * 0.5) / (bounds.height * 0.5)))) / 100;
		
		var res =  0.5 * Math.atan2(handleX, handleY) / Math.PI;
		
		if (res < 0)
		{
			res = 1 + res;
		}
		
		this.state.style['endAngle'] = res;
	});
	
	handles.push(handle2);
	
	return handles;
};

//**********************************************************************************************************************************************************
//Partial Concentric Ellipse
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicPartConcEllipse(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.startAngle = 0.25;
	this.endAngle = 0.75;
	this.arcWidth = 0.5;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasicPartConcEllipse, mxActor);

mxShapeBasicPartConcEllipse.prototype.customProperties = [
	{name: 'startAngle', dispName: 'Start Angle', type: 'float', min:0, max:1, defVal:0.25},
	{name: 'endAngle', dispName: 'End Angle', type: 'float', min:0, max:1, defVal:0.1},
	{name: 'arcWidth', dispName: 'Arc Width', type: 'float', min:0, max:1, defVal:0.5}
];

mxShapeBasicPartConcEllipse.prototype.cst = {PART_CONC_ELLIPSE : 'mxgraph.basic.partConcEllipse'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicPartConcEllipse.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	var startAngle = 2 * Math.PI * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.style, 'startAngle', this.startAngle))));
	var endAngle = 2 * Math.PI * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.style, 'endAngle', this.endAngle))));
	var arcWidth = 1 - Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.style, 'arcWidth', this.arcWidth))));
	var rx = w * 0.5;
	var ry = h * 0.5;
	var rx2 = rx * arcWidth;
	var ry2 = ry * arcWidth;
	
	var angDiff = endAngle - startAngle;
	
	if (angDiff < 0)
	{
		angDiff = angDiff + Math.PI * 2;
	}
	else if (angDiff == Math.PI)
	{
		endAngle = endAngle + 0.00001;
	}
	
	var startX = rx + Math.sin(startAngle) * rx;
	var startY = ry - Math.cos(startAngle) * ry;
	var innerStartX = rx + Math.sin(startAngle) * rx2;
	var innerStartY = ry - Math.cos(startAngle) * ry2;
	var endX = rx + Math.sin(endAngle) * rx;
	var endY = ry - Math.cos(endAngle) * ry;
	var innerEndX = rx + Math.sin(endAngle) * rx2;
	var innerEndY = ry - Math.cos(endAngle) * ry2;
	
		
	var bigArc = 0;
	
	if (angDiff >= Math.PI)
	{
		bigArc = 1;
	}
		
	c.begin();
	c.moveTo(startX, startY);
	c.arcTo(rx, ry, 0, bigArc, 1, endX, endY);
	c.lineTo(innerEndX, innerEndY);
	c.arcTo(rx2, ry2, 0, bigArc, 0, innerStartX, innerStartY);
	c.close();
	c.fillAndStroke();
};

mxCellRenderer.registerShape(mxShapeBasicPartConcEllipse.prototype.cst.PART_CONC_ELLIPSE, mxShapeBasicPartConcEllipse);

mxShapeBasicPartConcEllipse.prototype.constraints = null;

Graph.handleFactory[mxShapeBasicPartConcEllipse.prototype.cst.PART_CONC_ELLIPSE] = function(state)
{
	var handles = [Graph.createHandle(state, ['startAngle'], function(bounds)
	{
		var startAngle = 2 * Math.PI * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.state.style, 'startAngle', this.startAngle))));

		return new mxPoint(bounds.x + bounds.width * 0.5 + Math.sin(startAngle) * bounds.width * 0.5, bounds.y + bounds.height * 0.5 - Math.cos(startAngle) * bounds.height * 0.5);
	}, function(bounds, pt)
	{
		var handleX = Math.round(100 * Math.max(-1, Math.min(1, (pt.x - bounds.x - bounds.width * 0.5) / (bounds.width * 0.5)))) / 100;
		var handleY = -Math.round(100 * Math.max(-1, Math.min(1, (pt.y - bounds.y - bounds.height * 0.5) / (bounds.height * 0.5)))) / 100;
		
		var res =  0.5 * Math.atan2(handleX, handleY) / Math.PI;
		
		if (res < 0)
		{
			res = 1 + res;
		}

		this.state.style['startAngle'] = res;
		
	})];

	var handle2 = Graph.createHandle(state, ['endAngle'], function(bounds)
	{
		var endAngle = 2 * Math.PI * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.state.style, 'endAngle', this.endAngle))));

		return new mxPoint(bounds.x + bounds.width * 0.5 + Math.sin(endAngle) * bounds.width * 0.5, bounds.y + bounds.height * 0.5 - Math.cos(endAngle) * bounds.height * 0.5);
	}, function(bounds, pt)
	{
		var handleX = Math.round(100 * Math.max(-1, Math.min(1, (pt.x - bounds.x - bounds.width * 0.5) / (bounds.width * 0.5)))) / 100;
		var handleY = -Math.round(100 * Math.max(-1, Math.min(1, (pt.y - bounds.y - bounds.height * 0.5) / (bounds.height * 0.5)))) / 100;
		
		var res =  0.5 * Math.atan2(handleX, handleY) / Math.PI;
		
		if (res < 0)
		{
			res = 1 + res;
		}
		
		this.state.style['endAngle'] = res;
	});
	
	handles.push(handle2);
	
	var handle3 = Graph.createHandle(state, ['arcWidth'], function(bounds)
	{
		var arcWidth = Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.state.style, 'arcWidth', this.arcWidth))));

		return new mxPoint(bounds.x + bounds.width / 2, bounds.y + arcWidth * bounds.height * 0.5);
	}, function(bounds, pt)
	{
		this.state.style['arcWidth'] = Math.round(100 * Math.max(0, Math.min(bounds.height / 2, bounds.width / 2, (pt.y - bounds.y) / (bounds.height * 0.5)))) / 100;
	});
			
	handles.push(handle3);
	
	return handles;
};

//**********************************************************************************************************************************************************
//Numbered entry (vertical)
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicNumEntryVert(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.dy = 0.5;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasicNumEntryVert, mxActor);

mxShapeBasicNumEntryVert.prototype.cst = {NUM_ENTRY_VERT : 'mxgraph.basic.numberedEntryVert'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicNumEntryVert.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	var dy = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dy', this.dy))));

	var inset = 5;

	var d = Math.min(dy, w - 2 * inset, h - inset);
	
	c.ellipse(w * 0.5 - d * 0.5, 0, d, d);
	c.fillAndStroke();
	
	c.begin();
	c.moveTo(0, d * 0.5);
	c.lineTo(w * 0.5 - d * 0.5 - inset, d * 0.5);
	c.arcTo(d * 0.5 + inset, d * 0.5 + inset, 0, 0, 0, w * 0.5 + d * 0.5 + inset, d * 0.5);
	c.lineTo(w, d * 0.5);
	c.lineTo(w, h);
	c.lineTo(0, h);
	c.close();
	c.fillAndStroke();
};

mxCellRenderer.registerShape(mxShapeBasicNumEntryVert.prototype.cst.NUM_ENTRY_VERT, mxShapeBasicNumEntryVert);

mxShapeBasicNumEntryVert.prototype.constraints = null;

Graph.handleFactory[mxShapeBasicNumEntryVert.prototype.cst.NUM_ENTRY_VERT] = function(state)
{
	var handles = [Graph.createHandle(state, ['dy'], function(bounds)
	{
		var dy = Math.max(0, Math.min(bounds.width, bounds.width, parseFloat(mxUtils.getValue(this.state.style, 'dy', this.dy))));

		return new mxPoint(bounds.x + bounds.width / 2, bounds.y + dy);
	}, function(bounds, pt)
	{
		this.state.style['dy'] = Math.round(100 * Math.max(0, Math.min(bounds.height, bounds.width, pt.y - bounds.y))) / 100;
	})];
			
	return handles;
};

//**********************************************************************************************************************************************************
//Bending Arch
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicBendingArch(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.startAngle = 0.25;
	this.endAngle = 0.75;
	this.arcWidth = 0.5;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasicBendingArch, mxActor);

mxShapeBasicBendingArch.prototype.cst = {BENDING_ARCH : 'mxgraph.basic.bendingArch'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicBendingArch.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	var startAngle = 2 * Math.PI * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.style, 'startAngle', this.startAngle))));
	var endAngle = 2 * Math.PI * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.style, 'endAngle', this.endAngle))));
	var arcWidth = 1 - Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.style, 'arcWidth', this.arcWidth))));
	var rx = w * 0.5;
	var ry = h * 0.5;
	var rx2 = rx * arcWidth;
	var ry2 = ry * arcWidth;
	
	var startX = rx + Math.sin(startAngle) * rx;
	var startY = ry - Math.cos(startAngle) * ry;
	var innerStartX = rx + Math.sin(startAngle) * rx2;
	var innerStartY = ry - Math.cos(startAngle) * ry2;
	var endX = rx + Math.sin(endAngle) * rx;
	var endY = ry - Math.cos(endAngle) * ry;
	var innerEndX = rx + Math.sin(endAngle) * rx2;
	var innerEndY = ry - Math.cos(endAngle) * ry2;
	
	var angDiff = endAngle - startAngle;
	
	if (angDiff < 0)
	{
		angDiff = angDiff + Math.PI * 2;
	}
		
	var bigArc = 0;
	
	if (angDiff > Math.PI)
	{
		bigArc = 1;
	}

	var rx3 = rx2 - 5;
	var ry3 = ry2 - 5;

	c.ellipse(w * 0.5 - rx3, h * 0.5 - ry3, 2 * rx3, 2 * ry3);
	c.fillAndStroke();
	
	c.begin();
	c.moveTo(startX, startY);
	c.arcTo(rx, ry, 0, bigArc, 1, endX, endY);
	c.lineTo(innerEndX, innerEndY);
	c.arcTo(rx2, ry2, 0, bigArc, 0, innerStartX, innerStartY);
	c.close();
	c.fillAndStroke();
};

mxCellRenderer.registerShape(mxShapeBasicBendingArch.prototype.cst.BENDING_ARCH, mxShapeBasicBendingArch);

mxShapeBasicBendingArch.prototype.constraints = null;

Graph.handleFactory[mxShapeBasicBendingArch.prototype.cst.BENDING_ARCH] = function(state)
{
	var handles = [Graph.createHandle(state, ['startAngle'], function(bounds)
	{
		var startAngle = 2 * Math.PI * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.state.style, 'startAngle', this.startAngle))));

		return new mxPoint(bounds.x + bounds.width * 0.5 + Math.sin(startAngle) * bounds.width * 0.5, bounds.y + bounds.height * 0.5 - Math.cos(startAngle) * bounds.height * 0.5);
	}, function(bounds, pt)
	{
		var handleX = Math.round(100 * Math.max(-1, Math.min(1, (pt.x - bounds.x - bounds.width * 0.5) / (bounds.width * 0.5)))) / 100;
		var handleY = -Math.round(100 * Math.max(-1, Math.min(1, (pt.y - bounds.y - bounds.height * 0.5) / (bounds.height * 0.5)))) / 100;
		
		var res =  0.5 * Math.atan2(handleX, handleY) / Math.PI;
		
		if (res < 0)
		{
			res = 1 + res;
		}

		this.state.style['startAngle'] = res;
		
	})];

	var handle2 = Graph.createHandle(state, ['endAngle'], function(bounds)
	{
		var endAngle = 2 * Math.PI * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.state.style, 'endAngle', this.endAngle))));

		return new mxPoint(bounds.x + bounds.width * 0.5 + Math.sin(endAngle) * bounds.width * 0.5, bounds.y + bounds.height * 0.5 - Math.cos(endAngle) * bounds.height * 0.5);
	}, function(bounds, pt)
	{
		var handleX = Math.round(100 * Math.max(-1, Math.min(1, (pt.x - bounds.x - bounds.width * 0.5) / (bounds.width * 0.5)))) / 100;
		var handleY = -Math.round(100 * Math.max(-1, Math.min(1, (pt.y - bounds.y - bounds.height * 0.5) / (bounds.height * 0.5)))) / 100;
		
		var res =  0.5 * Math.atan2(handleX, handleY) / Math.PI;
		
		if (res < 0)
		{
			res = 1 + res;
		}
		
		this.state.style['endAngle'] = res;
	});
	
	handles.push(handle2);
	
	var handle3 = Graph.createHandle(state, ['arcWidth'], function(bounds)
	{
		var arcWidth = Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.state.style, 'arcWidth', this.arcWidth))));

		return new mxPoint(bounds.x + bounds.width / 2, bounds.y + arcWidth * bounds.height * 0.5);
	}, function(bounds, pt)
	{
		this.state.style['arcWidth'] = Math.round(100 * Math.max(0, Math.min(bounds.height / 2, bounds.width / 2, (pt.y - bounds.y) / (bounds.height * 0.5)))) / 100;
	});
			
	handles.push(handle3);
	
	return handles;
};

//**********************************************************************************************************************************************************
//Three Corner Round Rectangle
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicThreeCornerRoundRect(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.dx = 0.5;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasicThreeCornerRoundRect, mxActor);

mxShapeBasicThreeCornerRoundRect.prototype.customProperties = [
	{name: 'dx', dispName: 'Rounding Size', type: 'float', min:0, defVal:6}
];

mxShapeBasicThreeCornerRoundRect.prototype.cst = {THREE_CORNER_ROUND_RECT : 'mxgraph.basic.three_corner_round_rect'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicThreeCornerRoundRect.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	var dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'dx', this.dx)))) * 2;

	dx = Math.min(w * 0.5, h * 0.5, dx);
	
	c.begin();
	c.moveTo(dx, 0);
	c.lineTo(w - dx, 0);
	c.arcTo(dx, dx, 0, 0, 1, w, dx);
	c.lineTo(w, h - dx);
	c.arcTo(dx, dx, 0, 0, 1, w - dx, h);
	c.lineTo(0, h);
	c.lineTo(0, dx);
	c.arcTo(dx, dx, 0, 0, 1, dx, 0);
	c.close();
	c.fillAndStroke();
};

mxCellRenderer.registerShape(mxShapeBasicThreeCornerRoundRect.prototype.cst.THREE_CORNER_ROUND_RECT, mxShapeBasicThreeCornerRoundRect);

mxShapeBasicThreeCornerRoundRect.prototype.constraints = null;

Graph.handleFactory[mxShapeBasicThreeCornerRoundRect.prototype.cst.THREE_CORNER_ROUND_RECT] = function(state)
{
	var handles = [Graph.createHandle(state, ['dx'], function(bounds)
	{
		var dx = Math.max(0, Math.min(bounds.width / 4, bounds.width / 4, parseFloat(mxUtils.getValue(this.state.style, 'dx', this.dx))));

		return new mxPoint(bounds.x + dx, bounds.y + dx);
	}, function(bounds, pt)
	{
		this.state.style['dx'] = Math.round(100 * Math.max(0, Math.min(bounds.height / 4, bounds.width / 4, pt.x - bounds.x))) / 100;
	})];
			
	return handles;
};

mxShapeBasicThreeCornerRoundRect.prototype.getConstraints = function(style, w, h)
{
	var constr = [];

	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 0.5), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 1), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 1), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0.5), false));

	return (constr);
}

//**********************************************************************************************************************************************************
//Polygon
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicPolygon(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.dx = 0.5;
	this.dy = 0.5;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasicPolygon, mxActor);

mxShapeBasicPolygon.prototype.customProperties = [
	{name: 'polyline', dispName: 'Polyline', type: 'bool', defVal:false},
];

mxShapeBasicPolygon.prototype.cst = {POLYGON : 'mxgraph.basic.polygon'};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicPolygon.prototype.paintVertexShape = function(c, x, y, w, h)
{
    try
    {
        c.translate(x, y);
        var coords = JSON.parse(mxUtils.getValue(this.state.style, 'polyCoords', '[]'));
    	var polyline = mxUtils.getValue(this.style, 'polyline', false);
     
        if (coords.length > 0)
        {
            c.begin();
            c.moveTo(coords[0][0] * w, coords[0][1] * h);
           
            for (var i = 1; i < coords.length; i++)
            {
                c.lineTo(coords[i][0] * w, coords[i][1] * h);
            }
       
            if (polyline == false)
            {
                c.close();
            }
            
            c.end();
            c.fillAndStroke();
        }
    }
    catch (e)
    {
        // ignore
    }
};
 
mxCellRenderer.registerShape(mxShapeBasicPolygon.prototype.cst.POLYGON, mxShapeBasicPolygon);

mxShapeBasicPolygon.prototype.constraints = null;
 
Graph.handleFactory[mxShapeBasicPolygon.prototype.cst.POLYGON] = function(state)
{
    var handles = [];
 
    try
    {
        var c = JSON.parse(mxUtils.getValue(state.style, 'polyCoords', '[]'));
               
        for (var i = 0; i < c.length; i++)
        {
            (function(index)
            {
                handles.push(Graph.createHandle(state, ['polyCoords'], function(bounds)
                {
                    return new mxPoint(bounds.x + c[index][0] * bounds.width, bounds.y + c[index][1] * bounds.height);
                }, function(bounds, pt)
                {
                    var x = Math.round(100 * Math.max(0, Math.min(1, (pt.x - bounds.x) / bounds.width))) / 100;
                    var y = Math.round(100 * Math.max(0, Math.min(1, (pt.y - bounds.y) / bounds.height))) / 100;
                   
                    c[index] = [x, y];
                    state.style['polyCoords'] = JSON.stringify(c);
                   
                }, false));
            })(i);
        }
    }
    catch (e)
    {
        // ignore
    }
   
    return handles;
};

//**********************************************************************************************************************************************************
//Rectangle with pattern fill
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeBasicPatternFillRect(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.dx = 0.5;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeBasicPatternFillRect, mxActor);

mxShapeBasicPatternFillRect.prototype.cst = {PATTERN_FILL_RECT : 'mxgraph.basic.patternFillRect'};

mxShapeBasicPatternFillRect.prototype.customProperties = [
	{name: 'step', dispName: 'Fill Step', type: 'float', min:0, defVal:5},
	{name: 'fillStyle', dispName: 'Fill Style', type: 'enum', defVal:'none',
		enumList:[
			{val: 'none', dispName: 'None'},
			{val: 'diag', dispName: 'Diagonal'},
			{val: 'diagRev', dispName: 'Diagonal Reverse'},
			{val: 'vert', dispName: 'Vertical'},
			{val: 'hor', dispName: 'Horizontal'},
			{val: 'grid', dispName: 'Grid'},
			{val: 'diagGrid', dispName: 'Diagonal Grid'}
	]},
	{name: 'fillStrokeWidth', dispName: 'Fill Stroke Width', type: 'float', min:0, defVal:1},
	{name: 'fillStrokeColor', dispName: 'Fill Stroke Color', type: 'color', defVal:'#cccccc'},
	{name: 'top', dispName: 'Top Line', type: 'bool', defVal:true},
	{name: 'right', dispName: 'Right Line', type: 'bool', defVal:true},
	{name: 'bottom', dispName: 'Bottom Line', type: 'bool', defVal:true},
	{name: 'left', dispName: 'Left Line', type: 'bool', defVal:true}
];

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeBasicPatternFillRect.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);
	
	var strokeColor = mxUtils.getValue(this.style, 'strokeColor', '#000000');
	var strokeWidth = mxUtils.getValue(this.style, 'strokeWidth', '1');
	
	c.rect(0, 0, w, h);
	c.fill();

	var fillStrokeColor = mxUtils.getValue(this.style, 'fillStrokeColor', '#cccccc');
	var fillStrokeWidth = parseFloat(mxUtils.getValue(this.style, 'fillStrokeWidth', 1));
	
	c.setStrokeColor(fillStrokeColor);
	c.setStrokeWidth(fillStrokeWidth);
	
	var step = parseFloat(mxUtils.getValue(this.style, 'step', 5));
	var fillStyle = mxUtils.getValue(this.style, 'fillStyle', 'none');

	if (fillStyle == 'diag' || fillStyle == 'diagGrid')
	{
		step = step * 1.41;
		var i = 0;
		
		c.begin();
		
		while (i < (h + w))
		{
			var cx = 0;
			var cy = 0;
			
			if (i <= h)
			{
				c.moveTo(0, i);
				
				if(i <= w)
				{
					c.lineTo(i, 0);
				}
				else
				{
					c.lineTo(w, i - w);
				}
			}
			else
			{
				c.moveTo(i - h, h);
				
				if(i <= w)
				{
					c.lineTo(i, 0);
				}
				else
				{
					c.lineTo(w, i - w);
				}
			}
			
			i = i + step;
		}
		
		c.stroke();
	}
	else if (fillStyle == 'vert' || fillStyle == 'grid')
	{
		c.begin();
		var i = 0;
		
		while (i <= w)
		{
			var cx = 0;
			var cy = 0;
			
			c.moveTo(i, 0);
			c.lineTo(i, h);
			
			i = i + step;
		}
		
		c.stroke();
	}
	
	if (fillStyle == 'diagRev' || fillStyle == 'diagGrid')
	{
		if (fillStyle == 'diagRev')
		{
			step = step * 1.41;
		}

		var i = 0;
		
		c.begin();
		
		while (i < (h + w))
		{
			var cx = 0;
			var cy = 0;
			
			if (i <= h)
			{
				c.moveTo(w, i);
				
				if(i <= w)
				{
					c.lineTo(w - i, 0);
				}
				else
				{
					c.lineTo(w - w, i - w);
				}
			}
			else
			{
				c.moveTo(w - i + h, h);
				
				if(i <= w)
				{
					c.lineTo(w - i, 0);
				}
				else
				{
					c.lineTo(0, i - w);
				}
			}
			
			i = i + step;
		}
		
		c.stroke();
	}
	else if (fillStyle == 'hor' || fillStyle == 'grid')
	{
		c.begin();
		var i = 0;
		
		while (i <= h)
		{
			var cx = 0;
			var cy = 0;
			
			c.moveTo(0, i);
			c.lineTo(w, i);
			
			i = i + step;
		}
		
		c.stroke();
	}

	c.setStrokeColor(strokeColor);
	c.setStrokeWidth(strokeWidth);
	
	c.begin();
	c.moveTo(0, 0);
	
	if (mxUtils.getValue(this.style, 'top', '1') == '1')
	{
		c.lineTo(w, 0);
	}
	else
	{
		c.moveTo(w, 0);
	}
	
	if (mxUtils.getValue(this.style, 'right', '1') == '1')
	{
		c.lineTo(w, h);
	}
	else
	{
		c.moveTo(w, h);
	}
	
	if (mxUtils.getValue(this.style, 'bottom', '1') == '1')
	{
		c.lineTo(0, h);
	}
	else
	{
		c.moveTo(0, h);
	}
	
	if (mxUtils.getValue(this.style, 'left', '1') == '1')
	{
		c.lineTo(0, 0);
	}
				
	c.end();
	c.stroke();
};

mxCellRenderer.registerShape(mxShapeBasicPatternFillRect.prototype.cst.PATTERN_FILL_RECT, mxShapeBasicPatternFillRect);

mxShapeBasicPatternFillRect.prototype.getConstraints = function(style, w, h)
{
	var constr = [];

	constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0.25, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0.75, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 0), false));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 0.25), false));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 0.5), false));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 0.75), false));
	constr.push(new mxConnectionConstraint(new mxPoint(1, 1), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0.75, 1), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0.75, 1), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0.5, 1), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0.25, 1), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 1), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0.75), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0.5), false));
	constr.push(new mxConnectionConstraint(new mxPoint(0, 0.25), false));

	return (constr);
}

