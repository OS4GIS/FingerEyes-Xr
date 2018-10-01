/**  
 * @desc data 네임스페이스입니다. 공간 데이터 및 속성 데이터와 관련된 정보를 관리하는 클래스들을 담고 있습니다. 
 * @namespace
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */
Xr.data = Xr.data || {};

/**  
 * @classdesc 타원 그래픽 Row에 대한 클래스입니다. 
 * @class
 * @param {int} id - Row에 대한 고유 ID
 * @param {Xr.data.EllipseShapeData} graphicData - 타원 그래픽 데이터에 대한 객체
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */
Xr.data.EllipseGraphicRow = Xr.Class({
    name: "EllipseGraphicRow",
	extend: Xr.data.GraphicRow,
	requires: [Xr.data.IGraphicRow, Xr.IHitTest],

	construct: function (id, /* EllipseShapeData */ graphicData, /* boolean */ bMeasured) {
	    Xr.data.GraphicRow.call(this, id, graphicData.clone());

	    this._penSymbol = new Xr.symbol.PenSymbol();
	    this._brushSymbol = new Xr.symbol.BrushSymbol();

	    this._bMeasured = bMeasured;
	},
 	
    methods: {
        /* string */ toString: function () {
            var strJSON = JSON.stringify(this);
            var objJSON = JSON.parse(strJSON);

            delete objJSON._id;
            objJSON.metadata = {
                type: "Ellipse"
            };

            return JSON.stringify(objJSON);
        },

	    /* PenSymbol */ penSymbol: function (/* optional PenSymbol */ penSymbol) {
	        if (arguments.length == 1) {
	            this._penSymbol = penSymbol;
	        } else {
	            return this._penSymbol;
	        }
	    },

	    /* BrushSymbol */ brushSymbol: function(/* optional BrushSymbol */ brushSymbol) {
	        if (arguments.length == 1) {
	            this._brushSymbol = brushSymbol;
	        } else {
	            return this._brushSymbol;
	        }
	    },

	    /* SVG Element */ appendSVG: function (/* CoordMapper */ coordMapper, /* SVG Element */ container) {
	        var xmlns = Xr.CommonStrings.SVG_NAMESPACE;
	        var data = this.graphicData().data();

	        var vp = coordMapper.W2V(new Xr.PointD(data.cx, data.cy));
	        var vrx = coordMapper.viewLength(data.rx);
	        var vry = coordMapper.viewLength(data.ry);

	        var svg = document.createElementNS(xmlns, "ellipse");
	        svg.setAttribute("cx", vp.x);
	        svg.setAttribute("cy", vp.y);
	        svg.setAttribute("rx", vrx);
	        svg.setAttribute("ry", vry);

            this._penSymbol.attribute(svg);
	        this._brushSymbol.attribute(svg);
	        
	        var groupSVG = document.createElementNS(xmlns, "g");
	        groupSVG.appendChild(svg);

	        if (this._bMeasured) {
	            var minX = data.cx - data.rx;
	            var minY = data.cy - data.ry;
	            var maxX = data.cx + data.rx;
	            var maxY = data.cy + data.ry;

	            var g_measured = document.createElementNS(xmlns, "g");
	            var wpa = new Xr.PointD((maxX + minX) / 2, maxY);
	            var wpb = new Xr.PointD(maxX, (maxY + minY) / 2);

	            var vpa = coordMapper.W2V(wpa);
	            var vpb = coordMapper.W2V(wpb);

	            var a = maxX - minX;
	            var b = maxY - minY;

	            var txtSvga = Xr.OperationHelper.strokeTextSvg(vpa.x, vpa.y, a.toFixed(2) + "m", 18, "#ffffff", "#313131", 4);
	            var txtSvgb = Xr.OperationHelper.strokeTextSvg(vpb.x, vpb.y, b.toFixed(2) + "m", 18, "#ffffff", "#313131", 4, 90);

	            g_measured.appendChild(txtSvga);
	            g_measured.appendChild(txtSvgb);
	            groupSVG.appendChild(g_measured);
	        }

	        container.appendChild(groupSVG);

	        return groupSVG;
	    },
	}
}); 