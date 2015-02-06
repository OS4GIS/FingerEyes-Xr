Xr.data = Xr.data || {};

/**
 * @classdesc 텍스트 그래픽 Row에 대한 클래스입니다. 
 * @class
 * @param {int} id - Row에 대한 고유 ID
 * @param {Xr.data.TextShapeData} graphicData - 텍스트 그래픽 데이터에 대한 객체
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */
Xr.data.TextGraphicRow = Xr.Class({
    name: "TextGraphicRow",
	extend: Xr.data.GraphicRow,
	requires: [Xr.data.IGraphicRow, Xr.IHitTest],

	construct: function (id, /* TextShapeData */ graphicData/* , CoordMapper coordMapper */) {
	    Xr.data.GraphicRow.call(this, id, graphicData.clone());
	    this._fontSymbol = new Xr.symbol.FontSymbol();
	},

	methods: {
	    /* FontSymbol */ fontSymbol: function (/* optional FontSymbol */ fontSymbol) {
	        if (arguments.length == 1) {
	            this._fontSymbol = fontSymbol;
	        } else {
	            return this._fontSymbol;
	        }
	    },

	    MBR: function (/* CoordMapper */ coordMapper, /* SVG Element */ container) {
	        var svg = this.createSVG(coordMapper);
	        container.appendChild(svg);
	        var bBox = svg.getBBox();
	        container.removeChild(svg);

	        var minXY = coordMapper.V2W(bBox.x, bBox.y + bBox.height);
	        var maxXY = coordMapper.V2W(bBox.x + bBox.width, bBox.y);

	        this._graphicData.MBR().set(minXY.x, minXY.y, maxXY.x, maxXY.y);

	        return this._graphicData.MBR();
	    },

	    /* SVG Element */ createSVG: function (/* CoordMapper */ coordMapper) {
            //this.graphicData().regenMBR(coordMapper, this._fontSymbol);

	        var xmlns = Xr.CommonStrings.SVG_NAMESPACE;
	        var data = this.graphicData().data();
	        var text = data.text;

	        var vp = coordMapper.W2V(new Xr.PointD(data.x, data.y));
	        var g = document.createElementNS(xmlns, "g");
	        var strokeSvg = undefined;

	        if (this._fontSymbol.needStroke()) {
	            strokeSvg = document.createElementNS(xmlns, "text");
	            strokeSvg.setAttribute("x", vp.x);
	            strokeSvg.setAttribute("y", vp.y);
	            strokeSvg.setAttribute("text-anchor", "middle");
	            this._fontSymbol.attributeForStroke(strokeSvg);
	            strokeSvg.textContent = text;
	        }

	        var textSvg = document.createElementNS(xmlns, "text");
	        textSvg.setAttribute("x", vp.x);
	        textSvg.setAttribute("y", vp.y);
	        textSvg.setAttribute("text-anchor", "middle");
	        this._fontSymbol.attribute(textSvg);
	        textSvg.textContent = text;

	        if (strokeSvg != undefined) {
	            var filter = document.createElementNS(xmlns, "filter");
	            filter.setAttribute("id", "_fe_labelBlur");

	            var blur = document.createElementNS(xmlns, "feGaussianBlur");
	            blur.setAttribute("stdDeviation", "1.5");

	            filter.appendChild(blur);
	            g.appendChild(filter);

	            stroke.setAttribute("filter", "url(#_fe_labelBlur)");
	            g.appendChild(strokeSvg);
	        }

	        g.appendChild(textSvg);

	        return g;
	    },

	    ///* boolean */ hitTest: function (/* number */ x, /* number */ y, /* CoordMapper */ cm) {
	    //    var mbr = this.graphicData().MBR();
	    //    var coord = cm.V2W(x, y);
        //
	    //    return Xr.GeometryHelper.pointInMBR(mbr, coord, 0);
	    //}
	}
});