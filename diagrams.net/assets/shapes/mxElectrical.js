/**
 * $Id: mxElectrical.js,v 1.0 2016/10/25 17:05:39 mate Exp $
 * Copyright (c) 2006-2016, JGraph Ltd
 */

//**********************************************************************************************************************************************************
//Test Point
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeElectricalTestPoint(bounds, fill, stroke, strokewidth)
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
mxUtils.extend(mxShapeElectricalTestPoint, mxShape);

mxShapeElectricalTestPoint.prototype.cst = {
		SHAPE_TEST_POINT : 'mxgraph.electrical.transmission.testPoint'
};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeElectricalTestPoint.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);
	var strokeColor = mxUtils.getValue(this.style, mxConstants.STYLE_STROKECOLOR, '#000000');

	var size = Math.min(w, h); 
	
	c.setFillColor(strokeColor);
	c.begin();
	c.ellipse(w * 0.5 - size / 2, 0, size, size);
	c.fillAndStroke();
	
	if (h > w)
	{
		c.begin();
		c.moveTo(w * 0.5, size);
		c.lineTo(w * 0.5, h);
		c.stroke();
	}
};

mxCellRenderer.registerShape(mxShapeElectricalTestPoint.prototype.cst.SHAPE_TEST_POINT, mxShapeElectricalTestPoint);

mxShapeElectricalTestPoint.prototype.constraints = [
                                                  new mxConnectionConstraint(new mxPoint(0.5, 0), true),
                                                  new mxConnectionConstraint(new mxPoint(0.5, 1), true)
                                                  ];

//**********************************************************************************************************************************************************
//Straight Bus
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeElectricalStraightBus(bounds, fill, stroke, strokewidth)
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
mxUtils.extend(mxShapeElectricalStraightBus, mxShape);

mxShapeElectricalStraightBus.prototype.cst = {
		SHAPE_STRAIGHT_BUS : 'mxgraph.electrical.transmission.straightBus'
};



/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeElectricalStraightBus.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	var x1 = w * 0.2;
	var y1 = 0;
	
	if (w > h)
	{
		y1 = h * 0.5;
	}
	else
	{
		y1 = w / 2;
	}
	
	c.begin();
	c.moveTo(w - x1, 0);
	c.lineTo(w - x1, h - y1);
	c.lineTo(w, h - y1);
	c.lineTo(w * 0.5, h);
	c.lineTo(0, h - y1);
	c.lineTo(x1, h - y1);
	c.lineTo(x1, 0);
	c.fillAndStroke();
};

mxCellRenderer.registerShape(mxShapeElectricalStraightBus.prototype.cst.SHAPE_STRAIGHT_BUS, mxShapeElectricalStraightBus);

mxShapeElectricalStraightBus.prototype.constraints = [
                                                    new mxConnectionConstraint(new mxPoint(0.5, 0), true),
                                                    new mxConnectionConstraint(new mxPoint(0.5, 1), true)
                                                    ];

//**********************************************************************************************************************************************************
//Two-Line Bus Elbow
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeElectricalTwoLineBusElbow(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.notch = 0;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeElectricalTwoLineBusElbow, mxShape);

mxShapeElectricalTwoLineBusElbow.prototype.cst = {
		SHAPE_TWO_LINE_BUS_ELBOW : 'mxgraph.electrical.transmission.twoLineBusElbow'
};

mxShapeElectricalTwoLineBusElbow.prototype.customProperties = [
	{name:'notch', dispName:'Spacing', type:'float', min:0, defVal:25}
];

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeElectricalTwoLineBusElbow.prototype.paintVertexShape = function(c, x, y, w, h)
{
	var notch = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'notch', this.notch))));

	c.translate(x, y);

	c.begin();
	c.moveTo(0, h);
	c.lineTo(w, h);
	c.lineTo(w, 0);
	c.stroke();
	
	var wn = Math.min(w, notch);
	var hn = Math.min(h, notch);
	
	c.begin();
	c.moveTo(0, h - hn);
	c.lineTo(w - wn, h - hn);
	c.lineTo(w - wn, 0);
	c.stroke();
};

mxCellRenderer.registerShape(mxShapeElectricalTwoLineBusElbow.prototype.cst.SHAPE_TWO_LINE_BUS_ELBOW, mxShapeElectricalTwoLineBusElbow);

mxShapeElectricalTwoLineBusElbow.prototype.constraints = null;

Graph.handleFactory[mxShapeElectricalTwoLineBusElbow.prototype.cst.SHAPE_TWO_LINE_BUS_ELBOW] = function(state)
{
	var handles = [Graph.createHandle(state, ['notch'], function(bounds)
	{
		var notch = Math.max(Math.min(bounds.height, parseFloat(mxUtils.getValue(this.state.style, 'notch', this.notch))), 0);

		return new mxPoint(bounds.x + bounds.width / 4, bounds.y + bounds.height - notch);
	}, function(bounds, pt)
	{
		this.state.style['notch'] = Math.round(0.2 * Math.max(0, bounds.width - pt.y + bounds.y)) / 0.2;
	})];
			
	return handles;

}

//**********************************************************************************************************************************************************
//Three-Line Bus Elbow
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeElectricalThreeLineBusElbow(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.notch = 0;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeElectricalThreeLineBusElbow, mxShape);

mxShapeElectricalThreeLineBusElbow.prototype.cst = {
		SHAPE_THREE_LINE_BUS_ELBOW : 'mxgraph.electrical.transmission.threeLineBusElbow'
};

mxShapeElectricalThreeLineBusElbow.prototype.customProperties = [
	{name:'notch', dispName:'Spacing', type:'float', min:0, defVal:30}
];

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeElectricalThreeLineBusElbow.prototype.paintVertexShape = function(c, x, y, w, h)
{
	var notch = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'notch', this.notch))));

	c.translate(x, y);

	c.begin();
	c.moveTo(0, h);
	c.lineTo(w, h);
	c.lineTo(w, 0);
	c.stroke();
	
	var wn = Math.min(w, notch);
	var hn = Math.min(h, notch);
	
	c.begin();
	c.moveTo(0, h - hn);
	c.lineTo(w - wn, h - hn);
	c.lineTo(w - wn, 0);
	c.stroke();
	
	c.begin();
	c.moveTo(0, h - hn / 2);
	c.lineTo(w - wn / 2, h - hn / 2);
	c.lineTo(w - wn / 2, 0);
	c.stroke();
};

mxCellRenderer.registerShape(mxShapeElectricalThreeLineBusElbow.prototype.cst.SHAPE_THREE_LINE_BUS_ELBOW, mxShapeElectricalThreeLineBusElbow);

mxShapeElectricalThreeLineBusElbow.prototype.constraints = null;

Graph.handleFactory[mxShapeElectricalThreeLineBusElbow.prototype.cst.SHAPE_THREE_LINE_BUS_ELBOW] = function(state)
{
	var handles = [Graph.createHandle(state, ['notch'], function(bounds)
	{
		var notch = Math.max(Math.min(bounds.height, parseFloat(mxUtils.getValue(this.state.style, 'notch', this.notch))), 0);

		return new mxPoint(bounds.x + bounds.width / 4, bounds.y + bounds.height - notch);
	}, function(bounds, pt)
	{
		this.state.style['notch'] = Math.round(0.2 * Math.max(0, bounds.width - pt.y + bounds.y)) / 0.2;
	})];
			
	return handles;

}

//**********************************************************************************************************************************************************
//Four-Line Bus Elbow
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeElectricalFourLineBusElbow(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.notch = 0;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeElectricalFourLineBusElbow, mxShape);

mxShapeElectricalFourLineBusElbow.prototype.cst = {
		SHAPE_FOUR_LINE_BUS_ELBOW : 'mxgraph.electrical.transmission.fourLineBusElbow'
};

mxShapeElectricalFourLineBusElbow.prototype.customProperties = [
	{name:'notch', dispName:'Spacing', type:'float', min:0, defVal:75}
];

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeElectricalFourLineBusElbow.prototype.paintVertexShape = function(c, x, y, w, h)
{
	var notch = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'notch', this.notch))));

	c.translate(x, y);

	c.begin();
	c.moveTo(0, h);
	c.lineTo(w, h);
	c.lineTo(w, 0);
	c.stroke();
	
	var wn = Math.min(w, notch);
	var hn = Math.min(h, notch);
	
	c.begin();
	c.moveTo(0, h - hn);
	c.lineTo(w - wn, h - hn);
	c.lineTo(w - wn, 0);
	c.stroke();
	
	c.begin();
	c.moveTo(0, h - hn / 3);
	c.lineTo(w - wn / 3, h - hn / 3);
	c.lineTo(w - wn / 3, 0);
	c.stroke();
	
	c.begin();
	c.moveTo(0, h - hn * 2 / 3);
	c.lineTo(w - wn * 2 / 3, h - hn * 2 / 3);
	c.lineTo(w - wn * 2 / 3, 0);
	c.stroke();
};

mxCellRenderer.registerShape(mxShapeElectricalFourLineBusElbow.prototype.cst.SHAPE_FOUR_LINE_BUS_ELBOW, mxShapeElectricalFourLineBusElbow);

mxShapeElectricalFourLineBusElbow.prototype.constraints = null;

Graph.handleFactory[mxShapeElectricalFourLineBusElbow.prototype.cst.SHAPE_FOUR_LINE_BUS_ELBOW] = function(state)
{
	var handles = [Graph.createHandle(state, ['notch'], function(bounds)
	{
		var notch = Math.max(Math.min(bounds.height, parseFloat(mxUtils.getValue(this.state.style, 'notch', this.notch))), 0);

		return new mxPoint(bounds.x + bounds.width / 4, bounds.y + bounds.height - notch);
	}, function(bounds, pt)
	{
		this.state.style['notch'] = Math.round(0.2 * Math.max(0, bounds.width - pt.y + bounds.y)) / 0.2;
	})];
			
	return handles;
}

//**********************************************************************************************************************************************************
//Four-Line Bus Elbow
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeElectricalEightLineBusElbow(bounds, fill, stroke, strokewidth)
{
	mxShape.call(this);
	this.bounds = bounds;
	this.fill = fill;
	this.stroke = stroke;
	this.strokewidth = (strokewidth != null) ? strokewidth : 1;
	this.notch = 0;
};

/**
* Extends mxShape.
*/
mxUtils.extend(mxShapeElectricalEightLineBusElbow, mxShape);

mxShapeElectricalEightLineBusElbow.prototype.cst = {
		SHAPE_EIGHT_LINE_BUS_ELBOW : 'mxgraph.electrical.transmission.eightLineBusElbow'
};

mxShapeElectricalEightLineBusElbow.prototype.customProperties = [
	{name:'notch', dispName:'Spacing', type:'float', min:0, defVal:180}
];

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeElectricalEightLineBusElbow.prototype.paintVertexShape = function(c, x, y, w, h)
{
	var notch = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, 'notch', this.notch))));

	c.translate(x, y);

	c.begin();
	c.moveTo(0, h);
	c.lineTo(w, h);
	c.lineTo(w, 0);
	c.stroke();
	
	var wn = Math.min(w, notch);
	var hn = Math.min(h, notch);
	
	c.begin();
	c.moveTo(0, h - hn);
	c.lineTo(w - wn, h - hn);
	c.lineTo(w - wn, 0);
	c.stroke();
	
	c.begin();
	c.moveTo(0, h - hn / 7);
	c.lineTo(w - wn / 7, h - hn / 7);
	c.lineTo(w - wn / 7, 0);
	c.stroke();
	
	c.begin();
	c.moveTo(0, h - hn * 2 / 7);
	c.lineTo(w - wn * 2 / 7, h - hn * 2 / 7);
	c.lineTo(w - wn * 2 / 7, 0);
	c.stroke();
	
	c.begin();
	c.moveTo(0, h - hn * 3 / 7);
	c.lineTo(w - wn * 3 / 7, h - hn * 3 / 7);
	c.lineTo(w - wn * 3 / 7, 0);
	c.stroke();
	
	c.begin();
	c.moveTo(0, h - hn * 4 / 7);
	c.lineTo(w - wn * 4 / 7, h - hn * 4 / 7);
	c.lineTo(w - wn * 4 / 7, 0);
	c.stroke();
	
	c.begin();
	c.moveTo(0, h - hn * 5 / 7);
	c.lineTo(w - wn * 5 / 7, h - hn * 5 / 7);
	c.lineTo(w - wn * 5 / 7, 0);
	c.stroke();
	
	c.begin();
	c.moveTo(0, h - hn * 6 / 7);
	c.lineTo(w - wn * 6 / 7, h - hn * 6 / 7);
	c.lineTo(w - wn * 6 / 7, 0);
	c.stroke();
	
};

mxCellRenderer.registerShape(mxShapeElectricalEightLineBusElbow.prototype.cst.SHAPE_EIGHT_LINE_BUS_ELBOW, mxShapeElectricalEightLineBusElbow);

mxShapeElectricalEightLineBusElbow.prototype.constraints = null;

Graph.handleFactory[mxShapeElectricalEightLineBusElbow.prototype.cst.SHAPE_EIGHT_LINE_BUS_ELBOW] = function(state)
{
	var handles = [Graph.createHandle(state, ['notch'], function(bounds)
	{
		var notch = Math.max(Math.min(bounds.height, parseFloat(mxUtils.getValue(this.state.style, 'notch', this.notch))), 0);

		return new mxPoint(bounds.x + bounds.width / 4, bounds.y + bounds.height - notch);
	}, function(bounds, pt)
	{
		this.state.style['notch'] = Math.round(0.2 * Math.max(0, bounds.width - pt.y + bounds.y)) / 0.2;
	})];
			
	return handles;
}

//**********************************************************************************************************************************************************
//Logic Gate
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeElectricalLogicGate(bounds, fill, stroke, strokewidth)
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
mxUtils.extend(mxShapeElectricalLogicGate, mxShape);

mxShapeElectricalLogicGate.prototype.cst = {
		SHAPE_LOGIC_GATE : 'mxgraph.electrical.logic_gates.logic_gate'
};

mxShapeElectricalLogicGate.prototype.customProperties = [
	{name: 'operation', dispName: 'Operation', type: 'enum', defVal:'and',
		enumList:[
			{val:'and', dispName:'And'},
			{val:'or', dispName:'Or'},
			{val:'xor', dispName:'Xor'}
		]},
	{name: 'numInputs', dispName: 'Inputs', type: 'int', min:2, defVal:2},
	{name: 'negating', dispName: 'Negating', type: 'bool', defVal:0}
];

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeElectricalLogicGate.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);
	var numInputs = parseInt(mxUtils.getValue(this.style, 'numInputs', '2'));
	var spacing = h / numInputs;
	var currH = spacing * 0.5;

	c.begin();
	c.moveTo(w * 0.8, h * 0.5);
	c.lineTo(w, h * 0.5);

	var operation = mxUtils.getValue(this.style, 'operation', 'and');

	for (var i = 0; i < numInputs; i++)
	{
		c.moveTo(0, currH);
		
		if (operation == 'and')
		{
			c.lineTo(w * 0.2, currH);
		}
		else
		{
			c.lineTo(w * 0.23, currH);
		}
		
		currH = currH + spacing;
	}

	c.stroke();


	switch(operation) {
	  case 'xor':
			c.begin();
			c.moveTo(w * 0.1, 0);
			c.arcTo(w * 0.6, h, 0, 0, 1, w * 0.1, h);
			c.stroke();
			//no break operation needed, XOR needs to draw an OR shape too
	  case 'or':
			c.begin();
			c.moveTo(w * 0.4, 0);
			c.arcTo(w * 0.45, h * 0.83, 0, 0, 1, w * 0.8, h * 0.5);
			c.arcTo(w * 0.45, h * 0.83, 0, 0, 1, w * 0.4, h);
			c.lineTo(w * 0.15, h);
			c.arcTo(w * 0.6, h, 0, 0, 0, w * 0.15, 0);
			c.close();
			c.fillAndStroke();
	    break;
	  default:
			c.begin();
			c.moveTo(w * 0.2, 0);
			c.lineTo(w * 0.5, 0);
			c.arcTo(w * 0.3, h * 0.5, 0, 0, 1, w * 0.5, h);
			c.lineTo(w * 0.2, h);
			c.close();
			c.fillAndStroke();
	};
	
	
	var negating = mxUtils.getValue(this.style, 'negating', '0');

	if (negating == '1')
	{
		var negSize;
		
		if(this.style.negSize)
		{
			var tmpSize = parseFloat(mxUtils.getValue(this.style, 'negSize', '0.13'));
			negSize = Math.min(w * tmpSize * 0.5, h * tmpSize);
		}
		else
		{
			negSize = Math.min(w * 0.04, h * 0.07);
		}
		
		c.begin();
		c.ellipse(w * 0.8, h * 0.5 - negSize * 0.5, negSize, negSize);
		c.fillAndStroke();
	}
};

mxCellRenderer.registerShape(mxShapeElectricalLogicGate.prototype.cst.SHAPE_LOGIC_GATE, mxShapeElectricalLogicGate);

mxShapeElectricalLogicGate.prototype.getConstraints = function(style)
{
	var constr = [new mxConnectionConstraint(new mxPoint(1, 0.5), false)];
	
	var numInputs = parseInt(mxUtils.getValue(style, 'numInputs', '2'));
	var spacing = 1 / numInputs;
	var currH = spacing * 0.5;

	for (var i = 0; i < numInputs; i++)
	{
		constr.push(new mxConnectionConstraint(new mxPoint(0, currH), false));
		currH = currH + spacing;
	}

	return (constr);
}

//**********************************************************************************************************************************************************
//Buffer
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeElectricalBuffer(bounds, fill, stroke, strokewidth)
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
mxUtils.extend(mxShapeElectricalBuffer, mxShape);

mxShapeElectricalBuffer.prototype.cst = {
		SHAPE_BUFFER2 : 'mxgraph.electrical.logic_gates.buffer2'
};

mxShapeElectricalBuffer.prototype.customProperties = [
	{name: 'negating', dispName: 'Negating', type: 'bool', defVal:0}
];

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeElectricalBuffer.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	c.begin();
	c.moveTo(0, h * 0.5);
	c.lineTo(w * 0.2, h * 0.5);
	c.moveTo(w * 0.8, h * 0.5);
	c.lineTo(w, h * 0.5);
	c.stroke();
	
	c.begin();
	c.moveTo(w * 0.2, 0);
	c.lineTo(w * 0.8, h * 0.5);
	c.lineTo(w * 0.2, h);
	c.close();
	c.fillAndStroke();
	
	var negating = mxUtils.getValue(this.style, 'negating', '0');

	if (negating == '1')
	{
		var negSize = Math.min(w * 0.04, h * 0.07);
		c.begin();
		c.ellipse(w * 0.8, h * 0.5 - negSize * 0.5, negSize, negSize);
		c.fillAndStroke();
	}
};

mxCellRenderer.registerShape(mxShapeElectricalBuffer.prototype.cst.SHAPE_BUFFER2, mxShapeElectricalBuffer);

mxShapeElectricalBuffer.prototype.constraints = [
    new mxConnectionConstraint(new mxPoint(0, 0.5), true),
    new mxConnectionConstraint(new mxPoint(1, 0.5), true)
    ];

//**********************************************************************************************************************************************************
//Dual In-Line IC
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeElectricalDualInLineIC(bounds, fill, stroke, strokewidth)
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
mxUtils.extend(mxShapeElectricalDualInLineIC, mxShape);

mxShapeElectricalDualInLineIC.prototype.cst = {
		SHAPE_DUAL_INLINE_IC : 'mxgraph.electrical.logic_gates.dual_inline_ic'
};

mxShapeElectricalDualInLineIC.prototype.customProperties = [
	{name: 'pinStyle', dispName: 'Pin Style', type: 'enum', defVal:'line',
		enumList:[
			{val:'line', dispName:'Line'},
			{val:'square', dispName:'Square'}
		]},
	{name: 'startPin', dispName: 'Starting Pin', type: 'enum', defVal:'n',
		enumList:[
			{val:'n', dispName:'N'},
			{val:'e', dispName:'E'},
			{val:'s', dispName:'S'},
			{val:'w', dispName:'W'}
		]},
	{name: 'pinSpacing', dispName: 'Pin Spacing', type: 'float', min:1, defVal:20},
	{name: 'pinLabelType', dispName: 'Pin Label Type', type: 'enum', defVal:'gen',
		enumList:[
			{val:'gen', dispName:'Generated'},
			{val:'cust', dispName:'Custom'}
		]},
	{name: 'labelCount', dispName: 'Number of Labels', type: 'int', defVal: 20, dependentProps: ['labelNames']},
	{name: 'labelNames', dispName: 'Label Names', type: 'staticArr', subType: 'string', sizeProperty: 'labelCount', subDefVal: 'a'}
];

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeElectricalDualInLineIC.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);
	var fontColor = mxUtils.getValue(this.style, 'fontColor', '#000000');
	c.setFontColor(fontColor);
	var startPin = mxUtils.getValue(this.style, 'startPin', 'n');
	var pinLabelType = mxUtils.getValue(this.style, 'pinLabelType', 'gen');
	var labelNames = mxUtils.getValue(this.style, 'labelNames', '').toString().split(',');

	c.begin();
	
	if (startPin == 'n' || startPin == 's')
	{
		c.rect(10, 0, w - 20, h);
	}
	else
	{
		c.rect(0, 10, w, h - 20);
	}

	c.fillAndStroke();

	var pinSpacing = parseFloat(mxUtils.getValue(this.style, 'pinSpacing', '20'));
	var pinStyle = mxUtils.getValue(this.style, 'pinStyle', 'line');
	var fontSize = parseFloat(mxUtils.getValue(this.style, 'fontSize', '12'));
	
	if (startPin == 'n' || startPin == 's')
	{
		var pinsOne = parseInt(h / pinSpacing);
	}
	else
	{
		var pinsOne = parseInt(w / pinSpacing);
	}
	
	if (pinStyle == 'line')
	{
		c.setFontSize(fontSize * 0.8);
		var pinCount = 1;
		var currH = pinSpacing * 0.5;
		
		c.begin();
		
		if (startPin == 'n' || startPin == 's')
		{
			while (pinCount * pinSpacing <= h)
			{
				c.moveTo(0, currH);
				c.lineTo(10, currH);
				c.moveTo(w - 10, currH);
				c.lineTo(w, currH);
		
				if (startPin == 'n')
				{
					var currPinNum = pinCount;
				}
				else
				{
					var currPinNum = pinsOne + pinCount;
				}

				if (pinLabelType == 'gen')
				{
					c.text(20, currH, 0, 0, currPinNum.toString(), mxConstants.ALIGN_LEFT, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
				}
				else if (currPinNum - 1 < labelNames.length)
				{
					c.text(20, currH, 0, 0, labelNames[currPinNum - 1].toString(), mxConstants.ALIGN_LEFT, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
				}
				
				if (startPin == 'n')
				{
					var pc2 = 2 * pinsOne - pinCount + 1;
				}
				else
				{
					var pc2 = pinsOne - pinCount + 1;
				}
				
				if (pinLabelType == 'gen')
				{
					c.text(w - 20, currH, 0, 0, pc2.toString(), mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
				}
				else if (pc2 - 1 < labelNames.length)
				{
					c.text(w - 20, currH, 0, 0, labelNames[pc2 - 1].toString(), mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
				}
				
				currH = currH + pinSpacing;
				pinCount++;
			}
		}
		else
		{
			while (pinCount * pinSpacing <= w)
			{
				c.moveTo(currH, 0);
				c.lineTo(currH, 10);
				c.moveTo(currH, h - 10);
				c.lineTo(currH, h);
		
				if (startPin == 'e')
				{
					var currPinNum = pinsOne - pinCount + 1;
				}
				else
				{
					var currPinNum = 2 * pinsOne - pinCount + 1;
				}
				
				if (pinLabelType == 'gen')
				{
					c.text(currH, 20, 0, 0, currPinNum.toString(), mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
				}
				else if (currPinNum - 1 < labelNames.length)
				{
					c.text(currH, 20, 0, 0, labelNames[currPinNum - 1].toString(), mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
				}
				
				if (startPin == 'e')
				{
					var pc2 = pinsOne + pinCount;
				}
				else
				{
					var pc2 = pinCount;
				}
				
				if (pinLabelType == 'gen')
				{
					c.text(currH, h - 20, 0, 0, pc2.toString(), mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
				}
				else if (pc2 - 1 < labelNames.length)
				{
					c.text(currH, h - 20, 0, 0, labelNames[pc2 - 1].toString(), mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
				}
				
				currH = currH + pinSpacing;
				pinCount++;
			}
		}
		
		c.stroke();
	}
	else
	{
		c.setFontSize(fontSize * 0.5);
		var pinCount = 1;
		var currH = pinSpacing * 0.5;

		if (startPin == 'n' || startPin == 's')
		{
			while (pinCount * pinSpacing <= h)
			{
				c.begin();
				c.rect(0, currH - pinSpacing * 0.25, 10, pinSpacing * 0.5);
				c.fillAndStroke();

				c.begin();
				c.rect(w - 10, currH - pinSpacing * 0.25, 10, pinSpacing * 0.5);
				c.fillAndStroke();
				
				if (startPin == 'n')
				{
					var currPinNum = pinCount;
				}
				else
				{
					var currPinNum = pinsOne + pinCount;
				}

				if (pinLabelType == 'gen')
				{
					c.text(5, currH + 1, 0, 0, currPinNum.toString(), mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
				}
				else if (currPinNum - 1 < labelNames.length)
				{
					c.text(5, currH + 1, 0, 0, labelNames[currPinNum - 1].toString(), mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
				}
				
				if (startPin == 'n')
				{
					var pc2 = 2 * pinsOne - pinCount + 1;
				}
				else
				{
					var pc2 = pinsOne - pinCount + 1;
				}
				
				if (pinLabelType == 'gen')
				{
					c.text(w - 5, currH + 1, 0, 0, pc2.toString(), mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
				}
				else if (pc2 - 1 < labelNames.length)
				{
					c.text(w - 5, currH + 1, 0, 0, labelNames[pc2 - 1].toString(), mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
				}

				currH = currH + pinSpacing;
				pinCount++;
			}
		}
		else
		{
			while (pinCount * pinSpacing <= w)
			{
				c.begin();
				c.rect(currH - pinSpacing * 0.25, 0, pinSpacing * 0.5, 10);
				c.fillAndStroke();

				c.begin();
				c.rect(currH - pinSpacing * 0.25, h - 10, pinSpacing * 0.5, 10);
				c.fillAndStroke();
				
				if (startPin == 'e')
				{
					var currPinNum = pinsOne - pinCount + 1;
				}
				else
				{
					var currPinNum = 2 * pinsOne - pinCount + 1;
				}

				if (pinLabelType == 'gen')
				{
					c.text(currH, 5, 0, 0, currPinNum.toString(), mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
				}
				else if (currPinNum - 1 < labelNames.length)
				{
					c.text(currH, 5, 0, 0, labelNames[currPinNum - 1].toString(), mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
				}
				
				if (startPin == 'e')
				{
					var pc2 = pinsOne + pinCount;
				}
				else
				{
					var pc2 = pinCount;
				}
				
				if (pinLabelType == 'gen')
				{
					c.text(currH, h - 5, 0, 0, pc2.toString(), mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
				}
				else if (pc2 - 1 < labelNames.length)
				{
					c.text(currH, h - 5, 0, 0, labelNames[pc2 - 1].toString(), mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
				}

				currH = currH + pinSpacing;
				pinCount++;
			}
		}
		
	}
	
	c.setShadow(false);
	
	c.begin();
	
	switch(startPin) {
	  case 'e':
			if (h > 40)
			{
				c.moveTo(w, h * 0.5 - 10);
				c.arcTo(12, 12, 0, 0, 0, w, h * 0.5 + 10);
			}
	    break;
	  case 's':
			if (w > 40)
			{
				c.moveTo(w * 0.5 - 10, h);
				c.arcTo(12, 12, 0, 0, 1, w * 0.5 + 10, h);
			}
	    break;
	  case 'w':
			if (h > 40)
			{
				c.moveTo(0, h * 0.5 - 10);
				c.arcTo(12, 12, 0, 0, 1, 0, h * 0.5 + 10);
			}
	    break;
	  default:
			if (w > 40)
			{
				c.moveTo(w * 0.5 - 10, 0);
				c.arcTo(12, 12, 0, 0, 0, w * 0.5 + 10, 0);
			}
	}
	
	c.stroke();
};

mxCellRenderer.registerShape(mxShapeElectricalDualInLineIC.prototype.cst.SHAPE_DUAL_INLINE_IC, mxShapeElectricalDualInLineIC);

mxShapeElectricalDualInLineIC.prototype.getConstraints = function(style, w, h)
{
	var constr = [];

	var pinSpacing = parseFloat(mxUtils.getValue(this.style, 'pinSpacing', '20'));
	var startPin = mxUtils.getValue(this.style, 'startPin', 'n');
	var pinCount = 1;
	var currH = pinSpacing * 0.5;
	var pinsOne = parseInt(h / pinSpacing);
	
	if (startPin == 'n' || startPin == 's')
	{
		while (pinCount * pinSpacing <= h)
		{
			constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, 0, currH));
			constr.push(new mxConnectionConstraint(new mxPoint(1, 0), false, null, 0, currH));
			currH = currH + pinSpacing;
			pinCount++;
		}
	}
	else
	{
		while (pinCount * pinSpacing <= w)
		{
			constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, currH, 0));
			constr.push(new mxConnectionConstraint(new mxPoint(0, 1), false, null, currH, 0));
			currH = currH + pinSpacing;
			pinCount++;
		}
	}
	
	return (constr);
}

//**********************************************************************************************************************************************************
//Quad Flat Package IC
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeElectricalQFPIC(bounds, fill, stroke, strokewidth)
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
mxUtils.extend(mxShapeElectricalQFPIC, mxShape);

mxShapeElectricalQFPIC.prototype.cst = {
		SHAPE_QFP_IC : 'mxgraph.electrical.logic_gates.qfp_ic'
};

mxShapeElectricalQFPIC.prototype.customProperties = [
	{name: 'pinStyle', dispName: 'Pin Style', type: 'enum', defVal:'line',
		enumList:[
			{val:'line', dispName:'Line'},
			{val:'square', dispName:'Square'}
		]},
	{name: 'startPin', dispName: 'Starting Pin', type: 'enum', defVal:'sw',
		enumList:[
			{val:'sw', dispName:'SW'},
			{val:'nw', dispName:'NW'},
			{val:'ne', dispName:'NE'},
			{val:'se', dispName:'SE'}
		]},
	{name: 'pinSpacing', dispName: 'Pin Spacing', type: 'float', min:1, defVal:20},
	{name: 'pinLabelType', dispName: 'Pin Label Type', type: 'enum', defVal:'gen',
		enumList:[
			{val:'gen', dispName:'Generated'},
			{val:'cust', dispName:'Custom'}
		]},
	{name: 'labelCount', dispName: 'Number of Labels', type: 'int', defVal: 40, dependentProps: ['labelNames']},
	{name: 'labelNames', dispName: 'Label Names', type: 'staticArr', subType: 'string', sizeProperty: 'labelCount', subDefVal: 'a'}
];

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeElectricalQFPIC.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);
	
	c.begin();
	c.moveTo(15, 10);
	c.lineTo(w - 15, 10);
	c.lineTo(w - 10, 15);
	c.lineTo(w - 10, h - 15);
	c.lineTo(w - 15, h - 10);
	c.lineTo(15, h - 10);
	c.lineTo(10, h - 15);
	c.lineTo(10, 15);
	c.close();
	c.fillAndStroke();

	var pinSpacing = parseFloat(mxUtils.getValue(this.style, 'pinSpacing', '20'));
	var pinStyle = mxUtils.getValue(this.style, 'pinStyle', 'line');
	var pinLabelType = mxUtils.getValue(this.style, 'pinLabelType', 'gen');
	var labelNames = mxUtils.getValue(this.style, 'labelNames', '').toString().split(',');
	var fontSize = parseFloat(mxUtils.getValue(this.style, 'fontSize', '12'));
	var fontColor = mxUtils.getValue(this.style, 'fontColor', '#000000');
	c.setFontColor(fontColor);
	var startPin = mxUtils.getValue(this.style, 'startPin', 'sw');
	
	if (pinStyle == 'line')
	{
		c.setFontSize(fontSize * 0.8);
		var pinCount = 1;
		var currH = pinSpacing * 0.5 + 20;
		
		c.begin();
		
		var pinsVOne = parseInt((h - pinSpacing - 40) / pinSpacing) + 1;
		var pinsHOne = parseInt((w - pinSpacing - 40) / pinSpacing) + 1;
		
		while (currH <= h - pinSpacing * 0.5 - 20)
		{
			c.moveTo(0, currH);
			c.lineTo(10, currH);
			c.moveTo(w - 10, currH);
			c.lineTo(w, currH);
			
			//west pins
			switch(startPin) {
			  case 'nw':
					var currPinNum = pinCount;
			    break;
			  case 'ne':
					var currPinNum = pinsHOne + pinCount;
			    break;
			  case 'se':
					var currPinNum = pinsVOne + pinsHOne + pinCount;
			    break;
			  default:
					var currPinNum = pinsVOne + 2 * pinsHOne + pinCount;
			}

			if (pinLabelType == 'gen')
			{
				c.text(20, currH, 0, 0, currPinNum.toString(), mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
			}
			else if (currPinNum - 1 < labelNames.length)
			{
				c.text(20, currH, 0, 0, labelNames[currPinNum - 1].toString(), mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
			}
			
			//east pins
			switch(startPin) {
			  case 'nw':
					var pc2 = pinsHOne + 2 * pinsVOne - pinCount + 1;
			    break;
			  case 'ne':
					var pc2 = 2 * pinsHOne + 2 * pinsVOne - pinCount + 1;
			    break;
			  case 'se':
					var pc2 = pinsVOne - pinCount + 1;
			    break;
			  default:
					var pc2 = pinsHOne + pinsVOne - pinCount + 1;
			}

			if (pinLabelType == 'gen')
			{
				c.text(w - 20, currH, 0, 0, pc2.toString(), mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
			}
			else if (pc2 - 1 < labelNames.length)
			{
				c.text(w - 20, currH, 0, 0, labelNames[pc2 - 1].toString(), mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
			}
			
			currH = currH + pinSpacing;
			pinCount++;
		}
		
		var pinCount = 1;
		var currH = pinSpacing * 0.5 + 20;
		
		while (currH <= w - pinSpacing * 0.5 - 20)
		{
			c.moveTo(currH, 0);
			c.lineTo(currH, 10);
			c.moveTo(currH, h - 10);
			c.lineTo(currH, h);
			
			//south pins
			switch(startPin) {
			  case 'nw':
					var currPinNum = pinsVOne + pinCount;
			    break;
			  case 'ne':
					var currPinNum = pinsVOne + pinsHOne + pinCount;
			    break;
			  case 'se':
					var currPinNum = 2 * pinsVOne + pinsHOne + pinCount;
			    break;
			  default:
					var currPinNum = pinCount;
			}
			
			if (pinLabelType == 'gen')
			{
				c.text(currH, h - 20, 0, 0, currPinNum.toString(), mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
			}
			else if (currPinNum - 1 < labelNames.length)
			{
				c.text(currH, h - 20, 0, 0, labelNames[currPinNum - 1].toString(), mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
			}

			//north pins
			switch(startPin) {
			  case 'nw':
					var pc2 = 2 * pinsHOne + 2 * pinsVOne - pinCount + 1;
			    break;
			  case 'ne':
					var pc2 = pinsHOne - pinCount + 1;
			    break;
			  case 'se':
					var pc2 = pinsHOne + pinsVOne - pinCount + 1;
			    break;
			  default:
					var pc2 = 2 * pinsHOne + pinsVOne - pinCount + 1;
			}
			
			if (pinLabelType == 'gen')
			{
				c.text(currH, 20, 0, 0, pc2.toString(), mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
			}
			else if (pc2 - 1 < labelNames.length)
			{
				c.text(currH, 20, 0, 0, labelNames[pc2 - 1].toString(), mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
			}
			
			currH = currH + pinSpacing;
			pinCount++;
		}
		
		c.stroke();
	}
	else
	{
		c.setFontSize(fontSize * 0.5);
		var pinCount = 1;
		var currH = pinSpacing * 0.5 + 20;
		var pinsVOne = parseInt((h - pinSpacing - 40) / pinSpacing) + 1;
		var pinsHOne = parseInt((w - pinSpacing - 40) / pinSpacing) + 1;
		
		while (currH <= h - pinSpacing * 0.5 - 20)
		{
			c.begin();
			c.rect(0, currH - pinSpacing * 0.25, 10, pinSpacing * 0.5);
			c.fillAndStroke();

			c.begin();
			c.rect(w - 10, currH - pinSpacing * 0.25, 10, pinSpacing * 0.5);
			c.fillAndStroke();
			
			//west pins
			switch(startPin) {
			  case 'nw':
					var currPinNum = pinCount;
			    break;
			  case 'ne':
					var currPinNum = pinsHOne + pinCount;
			    break;
			  case 'se':
					var currPinNum = pinsVOne + pinsHOne + pinCount;
			    break;
			  default:
					var currPinNum = pinsVOne + 2 * pinsHOne + pinCount;
			}

			if (pinLabelType == 'gen')
			{
				c.text(5, currH + 1, 0, 0, currPinNum.toString(), mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
			}
			else if (currPinNum - 1 < labelNames.length)
			{
				c.text(5, currH + 1, 0, 0, labelNames[currPinNum - 1].toString(), mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
			}
			
			//east pins
			switch(startPin) {
			  case 'nw':
					var pc2 = pinsHOne + 2 * pinsVOne - pinCount + 1;
			    break;
			  case 'ne':
					var pc2 = 2 * pinsHOne + 2 * pinsVOne - pinCount + 1;
			    break;
			  case 'se':
					var pc2 = pinsVOne - pinCount + 1;
			    break;
			  default:
					var pc2 = pinsHOne + pinsVOne - pinCount + 1;
			}

			if (pinLabelType == 'gen')
			{
				c.text(w - 5, currH + 1, 0, 0, pc2.toString(), mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
			}
			else if (pc2 - 1 < labelNames.length)
			{
				c.text(w - 5, currH + 1, 0, 0, labelNames[pc2 - 1].toString(), mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
			}

			currH = currH + pinSpacing;
			pinCount++;
		}
		
		var pinCount = 1;
		var currH = pinSpacing * 0.5 + 20;
		
		while (currH <= w - pinSpacing * 0.5 - 20)
		{
			c.begin();
			c.rect(currH - pinSpacing * 0.25, 0, pinSpacing * 0.5, 10);
			c.fillAndStroke();

			c.begin();
			c.rect(currH - pinSpacing * 0.25, h - 10, pinSpacing * 0.5, 10);
			c.fillAndStroke();
			
			//south pins
			switch(startPin) {
			  case 'nw':
					var currPinNum = pinsVOne + pinCount;
			    break;
			  case 'ne':
					var currPinNum = pinsVOne + pinsHOne + pinCount;
			    break;
			  case 'se':
					var currPinNum = 2 * pinsVOne + pinsHOne + pinCount;
			    break;
			  default:
					var currPinNum = pinCount;
			}
			
			if (pinLabelType == 'gen')
			{
				c.text(currH, h - 4, 0, 0, currPinNum.toString(), mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
			}
			else if (currPinNum - 1 < labelNames.length)
			{
				c.text(currH, h - 4, 0, 0, labelNames[currPinNum - 1].toString(), mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
			}

			//north pins
			switch(startPin) {
			  case 'nw':
					var pc2 = 2 * pinsHOne + 2 * pinsVOne - pinCount + 1;
			    break;
			  case 'ne':
					var pc2 = pinsHOne - pinCount + 1;
			    break;
			  case 'se':
					var pc2 = pinsHOne + pinsVOne - pinCount + 1;
			    break;
			  default:
					var pc2 = 2 * pinsHOne + pinsVOne - pinCount + 1;
			}
			
			if (pinLabelType == 'gen')
			{
				c.text(currH, 6, 0, 0, pc2.toString(), mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
			}
			else if (pc2 - 1 < labelNames.length)
			{
				c.text(currH, 6, 0, 0, labelNames[pc2 - 1].toString(), mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, 0);
			}

			currH = currH + pinSpacing;
			pinCount++;
		}
	}
	
	c.setShadow(false);
	
	if (w > 40)
	{
		c.setFillColor(mxUtils.getValue(this.style, 'strokeColor', '#000000'));

		c.begin();
		
		switch(startPin) {
		  case 'nw':
				c.ellipse(15, 15, 10, 10);
		    break;
		  case 'ne':
				c.ellipse(w - 25, 15, 10, 10);
		    break;
		  case 'se':
				c.ellipse(w - 25, h - 25, 10, 10);
		    break;
		  default:
				c.ellipse(15, h - 25, 10, 10);
		}
		
		c.fillAndStroke();
	}
};

mxCellRenderer.registerShape(mxShapeElectricalQFPIC.prototype.cst.SHAPE_QFP_IC, mxShapeElectricalQFPIC);

mxShapeElectricalQFPIC.prototype.getConstraints = function(style, w, h)
{
	var constr = [];

	var pinSpacing = parseFloat(mxUtils.getValue(this.style, 'pinSpacing', '20'));
	var pinCount = 1;
	var currH = pinSpacing * 0.5 + 20;
	
	var pinsOne = parseInt(h / pinSpacing);
	
	while (currH <= h - pinSpacing * 0.5 - 20)
	{
		constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, 0, currH));
		constr.push(new mxConnectionConstraint(new mxPoint(1, 0), false, null, 0, currH));
		currH = currH + pinSpacing;
	}
	
	var pinCount = 1;
	var currH = pinSpacing * 0.5 + 20;
	
	while (currH <= w - pinSpacing * 0.5 - 20)
	{
		constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, currH, 0));
		constr.push(new mxConnectionConstraint(new mxPoint(0, 1), false, null, currH, 0));
		currH = currH + pinSpacing;
	}
	
	
	return (constr);
}

//**********************************************************************************************************************************************************
//Mux
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeElectricalMux(bounds, fill, stroke, strokewidth)
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
mxUtils.extend(mxShapeElectricalMux, mxShape);

mxShapeElectricalMux.prototype.cst = {
		SHAPE_MUX : 'mxgraph.electrical.abstract.mux2'
};

mxShapeElectricalMux.prototype.customProperties = [
	{name: 'operation', dispName: 'Operation', type: 'enum', defVal:'mux',
		enumList:[
			{val:'mux', dispName:'Mux'},
			{val:'demux', dispName:'Demux'}
		]},
	{name: 'selectorPins', dispName: 'Selector Pins', type: 'int', min:1, max:8, defVal:1},
];

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeElectricalMux.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);
	var selectorPins = parseInt(mxUtils.getValue(this.style, 'selectorPins', '1'));
	var operation = mxUtils.getValue(this.style, 'operation', 'mux');
	var fontSize = parseFloat(mxUtils.getValue(this.style, 'fontSize', '12'));
	c.setFontSize(fontSize * 0.5);
	var fontColor = mxUtils.getValue(this.style, 'fontColor', '#000000');
	c.setFontColor(fontColor);
	var dir = mxUtils.getValue(this.style, 'direction', 'east');
	var txtRot = 0;
	
	switch(dir)
	{
		case 'south' :
			txtRot = 270;
			break;
		case 'west' :
			txtRot = 180;
			break;
		case 'north' :
			txtRot = 90;
			break;
	}
		
	switch(operation) 
	{
	  case 'demux':
			c.begin();
			c.moveTo(w - 10, 0);
			c.lineTo(10, h * 0.1);
			c.lineTo(10, h * 0.9 - 10);
			c.lineTo(w - 10, h - 10);
			c.close();
			c.fillAndStroke();
	    break;
	  default:
			c.begin();
			c.moveTo(10, 0);
			c.lineTo(w - 10, h * 0.1);
			c.lineTo(w - 10, h * 0.9 - 10);
			c.lineTo(10, h - 10);
			c.close();
			c.fillAndStroke();
	};
	
	var numInputs = 1;
	var numOutputs = 1;
	
	if (operation == 'mux')
	{
		numInputs = Math.pow(2, selectorPins);
		var spacing = (h - 16) / numInputs;
	}
	else
	{
		numOutputs = Math.pow(2, selectorPins);
		var spacing = (h - 16) / numOutputs;
	}
	
	var currH = 3 + spacing * 0.5;
	
	c.begin();
	
	if (numInputs == 1)
	{
		c.moveTo(0, (h - 10) * 0.5);
		c.lineTo(10, (h - 10) * 0.5);
	}
	else
	{
		for (var i = 0; i < numInputs; i++)
		{
			c.moveTo(0, currH);
			c.lineTo(10, currH);
			c.text(14, currH + 1, 0, 0, '' + i.toString(), mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, txtRot);
			currH = currH + spacing;
		}
	}

	if (numOutputs == 1)
	{
		c.moveTo(w - 10, (h - 10) * 0.5);
		c.lineTo(w, (h - 10) * 0.5);
	}
	else
	{
		for (var i = 0; i < numOutputs; i++)
		{
			c.moveTo(w - 10, currH);
			c.lineTo(w, currH);
			c.text(w - 14, currH + 1, 0, 0, '' + i.toString(), mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, txtRot);
			currH = currH + spacing;
		}
	}

	var spacing = (w - 20) / selectorPins;
	var currW = 10 + spacing * 0.5;
	
	for (var i = 0; i < selectorPins; i++)
	{
		if (operation == 'mux')
		{
			c.moveTo(currW, h - 10 - (currW - 10) / (w - 20) * h * 0.1);
		}
		else
		{
			c.moveTo(currW, h - 10 - (w - currW - 10) / (w - 20) * h * 0.1);
		}

		c.lineTo(currW, h);

		c.text(currW + 5, h -4, 0, 0, 'S' + (selectorPins - i - 1).toString(), mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE, 0, null, 0, 0, txtRot);
		currW = currW + spacing;
	}

	c.stroke();
};

mxCellRenderer.registerShape(mxShapeElectricalMux.prototype.cst.SHAPE_MUX, mxShapeElectricalMux);

mxShapeElectricalMux.prototype.getConstraints = function(style, w, h)
{
	var constr = [];
	var pinRange = (h - 16) / h;
	var selectorPins = parseInt(mxUtils.getValue(this.style, 'selectorPins', '1'));
	var operation = mxUtils.getValue(this.style, 'operation', 'mux');
	
	var numInputs = 1;
	var numOutputs = 1;
	
	if (operation == 'mux')
	{
		numInputs = Math.pow(2, selectorPins);
		var spacing = pinRange / numInputs;
	}
	else
	{
		numOutputs = Math.pow(2, selectorPins);
		var spacing = pinRange / numOutputs;
	}
	
	var currH = spacing * 0.5;
	
	if (numInputs == 1)
	{
		constr.push(new mxConnectionConstraint(new mxPoint(0, 0.5 * (h - 10) / h), false, 0, 0));
	}
	else
	{
		for (var i = 0; i < numInputs; i++)
		{
			constr.push(new mxConnectionConstraint(new mxPoint(0, currH), false, null, 0, 3));
			currH = currH + spacing;
		}
	}

	if (numOutputs == 1)
	{
		constr.push(new mxConnectionConstraint(new mxPoint(1, 0.5), false, null, 0, -5));
	}
	else
	{
		for (var i = 0; i < numOutputs; i++)
		{
			constr.push(new mxConnectionConstraint(new mxPoint(1, currH), false, null, 0, 3));
			currH = currH + spacing;
		}
	}

	var spacing = (w - 20) / (w * selectorPins);
	var currW = spacing * 0.5;
	
	for (var i = 0; i < selectorPins; i++)
	{
		constr.push(new mxConnectionConstraint(new mxPoint(currW, 1), false, null, 10, 0));
		currW = currW + spacing;
	}

	return (constr);
}

//**********************************************************************************************************************************************************
//Battery stack
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeElectricalBatteryStack(bounds, fill, stroke, strokewidth)
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
mxUtils.extend(mxShapeElectricalBatteryStack, mxShape);

mxShapeElectricalBatteryStack.prototype.cst = {
		SHAPE_BATTERY_STACK : 'mxgraph.electrical.miscellaneous.batteryStack'
};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeElectricalBatteryStack.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);

	var bw = h * 0.3;
	var strokeColor = mxUtils.getValue(this.style, mxConstants.STYLE_STROKECOLOR, '#000000');
	var dashed = mxUtils.getValue(this.style, mxConstants.STYLE_DASHED, '0');
	
	var bNum = Math.floor((w - 20) / bw);
	var startX = (w - bNum * bw) * 0.5;

	if (bNum > 0)
	{
		c.begin();
		c.moveTo(0, h * 0.5);
		c.lineTo(startX + bw * 0.2, h * 0.5);
		c.moveTo(w - startX - bw * 0.2, h * 0.5);
		c.lineTo(w, h * 0.5);
		c.stroke();
		
		var currX = startX;
		c.setFillColor(strokeColor);
		
		for (var i = 0; i < bNum; i++)
		{

			c.rect(currX + bw * 0.2, h * 0.25, bw * 0.2, h * 0.5);
			c.fillAndStroke();
			
			c.begin();
			c.moveTo(currX + bw * 0.8, 0);
			c.lineTo(currX + bw * 0.8, h);
			c.stroke();
			
			if (i > 0)
			{
				c.setDashed('1');
				c.begin();
				c.moveTo(currX - bw * 0.2, h * 0.5);
				c.lineTo(currX + bw * 0.2, h * 0.5);
				c.stroke();
				c.setDashed(dashed);
			}
			
			currX = currX + bw;
		}
	}
};

mxCellRenderer.registerShape(mxShapeElectricalBatteryStack.prototype.cst.SHAPE_BATTERY_STACK, mxShapeElectricalBatteryStack);

mxShapeElectricalBatteryStack.prototype.constraints = [
    new mxConnectionConstraint(new mxPoint(0, 0.5), true),
    new mxConnectionConstraint(new mxPoint(1, 0.5), true)
    ];

//**********************************************************************************************************************************************************
//DC Source 3 v2
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeElectricalDCSource3_v2(bounds, fill, stroke, strokewidth)
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
mxUtils.extend(mxShapeElectricalDCSource3_v2, mxShape);

mxShapeElectricalDCSource3_v2.prototype.cst = {
		SHAPE_DC_SOURCE_3_V2 : 'mxgraph.electrical.signal_sources.dc_source_3_v2'
};

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeElectricalDCSource3_v2.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);
	
	var ss = Math.max(3, Math.min(h, w) * 0.05); // half of symbol size
	var i = 3; //indent
	c.ellipse(0, 0, w, h);
	c.fillAndStroke();
	
	c.begin();
	c.moveTo(w * 0.5 - ss, h * 0.05 + i);
	c.lineTo(w * 0.5 + ss, h * 0.05 + i);
	c.moveTo(w * 0.5, h * 0.05 - ss + i);
	c.lineTo(w * 0.5, h * 0.05 + ss + i);
	c.moveTo(w * 0.5 - ss, h * 0.95 - i);
	c.lineTo(w * 0.5 + ss, h * 0.95 - i);
	c.stroke();
};

mxCellRenderer.registerShape(mxShapeElectricalDCSource3_v2.prototype.cst.SHAPE_DC_SOURCE_3_V2, mxShapeElectricalDCSource3_v2);

mxShapeElectricalDCSource3_v2.prototype.constraints = [
  new mxConnectionConstraint(new mxPoint(0.5, 0), true),
  new mxConnectionConstraint(new mxPoint(0.5, 1), true)
  ];

//**********************************************************************************************************************************************************
//Source
//**********************************************************************************************************************************************************
/**
* Extends mxShape.
*/
function mxShapeElectricalSource(bounds, fill, stroke, strokewidth)
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
mxUtils.extend(mxShapeElectricalSource, mxShape);

mxShapeElectricalSource.prototype.cst = {
		SHAPE_SOURCE : 'mxgraph.electrical.signal_sources.source'
};

mxShapeElectricalSource.prototype.customProperties = [
	{name: 'elSourceType', dispName: 'Source Type', type: 'enum', defVal: 'independent',
		enumList: [{val: 'independent', dispName: 'Independent'}, 
			       {val: 'dependent', dispName: 'Dependent'}]
	},
	{name: 'elSignalType', dispName: 'Signal Type', type: 'enum', defVal: 'ac',
		enumList: [{val: 'ac', dispName: 'AC'}, 
	       	   {val: 'none', dispName: 'None'},
	       	   {val: 'square', dispName: 'Square'},
	       	   {val: 'triangular', dispName: 'Triangular'},
	       	   {val: 'sawtooth', dispName: 'Sawtooth'},
	       	   {val: 'noise', dispName: 'Noise'},
	       	   {val: 'ideal', dispName: 'Ideal'},
	       	   {val: 'expSquib', dispName: 'Explosive Squib'},
	       	   {val: 'pulse', dispName: 'Pulse'},
	       	   {val: 'invPulse', dispName: 'Inverse Pulse'},
	       	   {val: 'chopSquare', dispName: 'Chopped Square'},
	       	   {val: 'stepOn', dispName: 'Step On'},
	       	   {val: 'stepOff', dispName: 'Step Off'},
	       	   {val: 'dc1', dispName: 'DC Horizontal'},
		       {val: 'dc2', dispName: 'DC Vertical'},
		       {val: 'dc3', dispName: 'DC Plus minus'}]
	}
];

/**
* Function: paintVertexShape
* 
* Paints the vertex shape.
*/
mxShapeElectricalSource.prototype.paintVertexShape = function(c, x, y, w, h)
{
	c.translate(x, y);
	
	var sourceType = mxUtils.getValue(this.style, 'elSourceType', 'independent');
	var signalType = mxUtils.getValue(this.style, 'elSignalType', 'none');

	switch (sourceType)
	{
		case "independent" :
				c.ellipse(0, 0, w, h);
				c.fillAndStroke();
			break;
		case "dependent" :
				c.begin();
				c.moveTo(0, h * 0.5);
				c.lineTo(w * 0.5, 0);
				c.lineTo(w, h * 0.5);
				c.lineTo(w * 0.5, h);
				c.lineTo(0, h * 0.5);
				c.close();
				c.fillAndStroke();
			break;
	}
	
	switch (signalType)
	{
		case "ac" :
				c.begin();
				c.moveTo(w * 0.3, h * 0.5);
				c.quadTo(w * 0.34, h * 0.35, w * 0.4, h * 0.35);
				c.quadTo(w * 0.46, h * 0.35, w * 0.5, h * 0.5);
				c.quadTo(w * 0.53, h * 0.65, w * 0.6, h * 0.65);
				c.quadTo(w * 0.66, h * 0.65, w * 0.7, h * 0.5);
				c.stroke();
			break;
		case "square" :
				c.begin();
				c.moveTo(w * 0.3, h * 0.5);
				c.lineTo(w * 0.3, h * 0.35);
				c.lineTo(w * 0.5, h * 0.35);
				c.lineTo(w * 0.5, h * 0.65);
				c.lineTo(w * 0.7, h * 0.65);
				c.lineTo(w * 0.7, h * 0.5);
				c.stroke();
			break;
		case "triangular" :
				c.begin();
				c.moveTo(w * 0.3, h * 0.65);
				c.lineTo(w * 0.4, h * 0.35);
				c.lineTo(w * 0.5, h * 0.65);
				c.lineTo(w * 0.6, h * 0.35);
				c.lineTo(w * 0.7, h * 0.65);
				c.stroke();
			break;
		case "sawtooth" :
				c.begin();
				c.moveTo(w * 0.24, h * 0.65);
				c.lineTo(w * 0.42, h * 0.35);
				c.lineTo(w * 0.42, h * 0.65);
				c.lineTo(w * 0.58, h * 0.35);
				c.lineTo(w * 0.58, h * 0.65);
				c.lineTo(w * 0.76, h * 0.35);
				c.lineTo(w * 0.76, h * 0.65);
				c.stroke();
			break;
		case "noise" :
				c.begin();
				c.moveTo(w * 0.5, h * 0.17);
				c.lineTo(w * 0.5, h * 0.5);
				c.moveTo(w * 0.18, h * 0.42);
				c.lineTo(w * 0.5, h * 0.5);
				c.moveTo(w * 0.32, h * 0.78);
				c.lineTo(w * 0.5, h * 0.5);
				c.moveTo(w * 0.82, h * 0.42);
				c.lineTo(w * 0.5, h * 0.5);
				c.moveTo(w * 0.68, h * 0.78);
				c.lineTo(w * 0.5, h * 0.5);
				c.stroke();
			break;
		case "ideal" :
				c.begin();
				c.moveTo(0, h * 0.5);
				c.lineTo(w, h * 0.5);
				c.stroke();
			break;
		case "expSquib" :
				c.ellipse(0, h * 0.43, w * 0.14, h * 0.14);
				c.stroke();
				c.ellipse(w * 0.86, h * 0.43, w * 0.14, h * 0.14);
				c.stroke();
				c.begin();
				c.moveTo(w * 0.83, h * 0.63);
				c.lineTo(w * 0.73, h * 0.73);
				c.lineTo(w * 0.27, h * 0.27);
				c.lineTo(w * 0.17, h * 0.37);
				c.stroke();
				c.begin();

				var strokeColor = mxUtils.getValue(this.style, mxConstants.STYLE_STROKECOLOR, '#000000');
				c.setFillColor(strokeColor);
				
				c.moveTo(w * 0.2, h * 0.25);
				c.lineTo(w * 0.13, h * 0.4);
				c.lineTo(w * 0.28, h * 0.33);
				c.close();
				c.fillAndStroke();
			break;
		case "pulse" :
				c.begin();
				c.moveTo(w * 0.3, h * 0.65);
				c.lineTo(w * 0.4, h * 0.65);
				c.lineTo(w * 0.4, h * 0.35);
				c.lineTo(w * 0.6, h * 0.35);
				c.lineTo(w * 0.6, h * 0.65);
				c.lineTo(w * 0.7, h * 0.65);
				c.stroke();
			break;
		case "invPulse" :
				c.begin();
				c.moveTo(w * 0.3, h * 0.35);
				c.lineTo(w * 0.4, h * 0.35);
				c.lineTo(w * 0.4, h * 0.65);
				c.lineTo(w * 0.6, h * 0.65);
				c.lineTo(w * 0.6, h * 0.35);
				c.lineTo(w * 0.7, h * 0.35);
				c.stroke();
			break;
		case "chopSquare" :
				c.begin();
				c.moveTo(w * 0.3, h * 0.5);
				c.lineTo(w * 0.33, h * 0.35);
				c.lineTo(w * 0.47, h * 0.35);
				c.lineTo(w * 0.53, h * 0.65);
				c.lineTo(w * 0.67, h * 0.65);
				c.lineTo(w * 0.7, h * 0.5);
				c.stroke();
			break;
		case "stepOn" :
				c.begin();
				c.moveTo(w * 0.3, h * 0.65);
				c.lineTo(w * 0.5, h * 0.65);
				c.lineTo(w * 0.5, h * 0.35);
				c.lineTo(w * 0.7, h * 0.35);
				c.stroke();
			break;
		case "stepOff" :
				c.begin();
				c.moveTo(w * 0.3, h * 0.35);
				c.lineTo(w * 0.5, h * 0.35);
				c.lineTo(w * 0.5, h * 0.65);
				c.lineTo(w * 0.7, h * 0.65);
				c.stroke();
			break;
		case "dc1" :
				c.begin();
				c.moveTo(w * 0.17, h * 0.5);
				c.lineTo(w * 0.83, h * 0.5);
				c.moveTo(w * 0.67, h * 0.42);
				c.lineTo(w * 0.83, h * 0.5);
				c.lineTo(w * 0.67, h * 0.58);
				c.stroke();
			break;
		case "dc2" :
				c.begin();
				c.moveTo(w * 0.5, h * 0.17);
				c.lineTo(w * 0.5, h * 0.83);
				c.moveTo(w * 0.42, h * 0.67);
				c.lineTo(w * 0.5, h * 0.83);
				c.lineTo(w * 0.58, h * 0.67);
				c.stroke();
			break;
		case "dc3" :
				var ss = Math.max(3, Math.min(h, w) * 0.05); // half of symbol size
				var i = 3; //indent
				
				if (sourceType == 'dependent')
				{
					i += 3;
				}
				
				c.begin();
				c.moveTo(w * 0.5 - ss, h * 0.05 + i);
				c.lineTo(w * 0.5 + ss, h * 0.05 + i);
				c.moveTo(w * 0.5, h * 0.05 - ss + i);
				c.lineTo(w * 0.5, h * 0.05 + ss + i);
				c.moveTo(w * 0.5 - ss, h * 0.95 - i);
				c.lineTo(w * 0.5 + ss, h * 0.95 - i);
				c.stroke();
			break;
	}
};

mxCellRenderer.registerShape(mxShapeElectricalSource.prototype.cst.SHAPE_SOURCE, mxShapeElectricalSource);
