Xr.ui = Xr.ui || {};

Xr.ui.ScaleBarControl = Xr.Class({
    name: "ScaleBarControl",
	extend: Xr.ui.UserControl,
	requires: [Xr.ui.IUserControl, Xr.IMouseInteraction],

	construct: function (/* String */ name, /* Map */ map) {
	    Xr.ui.UserControl.call(this, name, map);

	    this._svg = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "svg");
	    this._svg.style.position = "absolute";
	    //this._svg.style.top = "0px";
	    //this._svg.style.left = "0px";

	    this._svg.style.setProperty("pointer-events", "none");

	    this._fontSymbol = new Xr.symbol.FontSymbol();
	    this._fontSymbol.size(18);
	    this._fontSymbol.color("#ffffff");
	    this._fontSymbol.strokeColor("#000000");
	    this._fontSymbol.strokeWidth(2);

	    this.container().appendChild(this._svg);
	    this._scaleBarHeight = 16;
	    this._scaleBarWidth = 120;

	    this.container().style.bottom = 55;
	    this.container().style.left = 20;
	},
 	
	methods: {
	    fontSymbol: function() {
	        return this._fontSymbol;
	    },

	    scaleBarWidth: function(/* int */ v) {
	        if (arguments.length == 0) return this._scaleBarWidth;
	        else this._scaleBarWidth = v;
	    },

	    scaleBarHeight: function(/* int */ v) {
	        if (arguments.length == 0) return this._scaleBarHeight;
	        else this._scaleBarHeight = v;
	    },

	    _createLineSvg: function(/* number */ x1, /* number */ y1, /* number */ x2, /* number */ y2,
                /* String */ color, /* number */ width, /* Strig */ lineCap) {
	        var line = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "line");

	        line.setAttribute("x1", x1);
	        line.setAttribute("y1", y1);
	        line.setAttribute("x2", x2);
	        line.setAttribute("y2", y2);
	        line.setAttribute("stroke", color);
	        line.setAttribute("stroke-width", width);
	        line.setAttribute("stroke-linecap", lineCap);

	        return line;
	    },

	    update: function () {
	        var svg = this._svg;

            // Remove all of SVG elements
	        var childNodes = svg.childNodes;
	        var cntChildNodes = childNodes.length;
	        var childNode;

	        for (var i = 0; i < cntChildNodes; i++) {
	            childNode = childNodes[0];
	            svg.removeChild(childNode);
	        }
	        // .

	        // Create and append SVG elements
	        var coordMapper = this._map.coordMapper();
	        var baseY = 30;
	        var scaleBarWidth = this.scaleBarWidth();
	        var scaleBarHalfHeight = this.scaleBarHeight() / 2;
	        var mapScale = "1 : " + Math.ceil(coordMapper.mapScale());
	        var measureLength = Math.ceil(coordMapper.mapLength(scaleBarWidth)) + "m";

	        var lineStroke = this._createLineSvg(0, baseY, scaleBarWidth, baseY, "#000000", 3, "square");
	        var lineStrokeV1 = this._createLineSvg(0, baseY - scaleBarHalfHeight, 0, baseY + scaleBarHalfHeight, "#000000", 3, "square");
	        var lineStrokeV2 = this._createLineSvg(scaleBarWidth, baseY - scaleBarHalfHeight, scaleBarWidth, baseY + scaleBarHalfHeight, "#000000", 3, "square");

	        var line = this._createLineSvg(0, baseY, scaleBarWidth, baseY, "#ffffff", 1, "butt");
	        var lineV1 = this._createLineSvg(0, baseY - scaleBarHalfHeight, 0, baseY + scaleBarHalfHeight, "#ffffff", 1, "butt");
	        var lineV2 = this._createLineSvg(scaleBarWidth, baseY - scaleBarHalfHeight, scaleBarWidth, baseY + scaleBarHalfHeight, "#ffffff", 1, "butt");

	        var strokeMapScaleTextSvg = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "text");
	        strokeMapScaleTextSvg.setAttribute("x", scaleBarWidth + this._fontSymbol.size() / 2);
	        strokeMapScaleTextSvg.setAttribute("y", baseY + (this._fontSymbol.size() / 2) - 2);
	        strokeMapScaleTextSvg.setAttribute("text-anchor", "left");
	        this._fontSymbol.attributeForStroke(strokeMapScaleTextSvg);
	        strokeMapScaleTextSvg.textContent = mapScale;

	        var textMapScaleSvg = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "text");
	        textMapScaleSvg.setAttribute("x", scaleBarWidth + this._fontSymbol.size() / 2);
	        textMapScaleSvg.setAttribute("y", baseY + (this._fontSymbol.size() / 2) - 2);
	        textMapScaleSvg.setAttribute("text-anchor", "left");
	        this._fontSymbol.attribute(textMapScaleSvg);
	        textMapScaleSvg.textContent = mapScale;

	        var strokeLengthTextSvg = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "text");
	        strokeLengthTextSvg.setAttribute("x", scaleBarWidth/2);
	        strokeLengthTextSvg.setAttribute("y", baseY - 2);
	        strokeLengthTextSvg.setAttribute("text-anchor", "middle");
	        this._fontSymbol.attributeForStroke(strokeLengthTextSvg);
	        strokeLengthTextSvg.textContent = measureLength;

	        var textLengthSvg = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "text");
	        textLengthSvg.setAttribute("x", scaleBarWidth/2);
	        textLengthSvg.setAttribute("y", baseY - 2);
	        textLengthSvg.setAttribute("text-anchor", "middle");
	        this._fontSymbol.attribute(textLengthSvg);
	        textLengthSvg.textContent = measureLength;

	        svg.appendChild(lineStroke);
	        svg.appendChild(lineStrokeV1);
	        svg.appendChild(lineStrokeV2);

	        svg.appendChild(line);
	        svg.appendChild(lineV1);
	        svg.appendChild(lineV2);
	        
	        svg.appendChild(strokeMapScaleTextSvg);
	        svg.appendChild(textMapScaleSvg);
	        svg.appendChild(strokeLengthTextSvg);
	        svg.appendChild(textLengthSvg);
            // .
	    },

	    prepare: function () {
	        var that = this;
	        that.__onMapScaleChanged = function (e) {
	            that.update();
	        };

	        this._map.addEventListener(Xr.Events.MapScaleChanged, that.__onMapScaleChanged);
	    },

	    release: function () {
	        if (this.__onMapScaleChanged) {
	            this._map.removeEventListener(Xr.Events.MapScaleChanged, this.__onMapScaleChanged);
	            delete this.__onMapScaleChanged;
	        }
	    },

	    mouseDown: function (e) { },
	    mouseMove: function (e) { },
	    mouseUp: function (e) { },
	    click: function (e) { },
	    dblClick: function (e) { }
	}
});