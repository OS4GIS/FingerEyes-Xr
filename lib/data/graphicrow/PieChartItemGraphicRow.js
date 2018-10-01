Xr.data = Xr.data || {};

/**
 * @classdesc 여러개의 텍스트를 박스 장식과 함게 표현하는 Graphic Row에 대한 클래스입니다. 
 * @class
 * @param {int} id - Row에 대한 고유 ID
 * @param {Xr.data.DecorationTextsShapeData} graphicData - 라이브 텍스트 객체 그래픽 데이터에 대한 객체
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */

Xr.data.PieChartItemGraphicRow = Xr.Class({
    name: "PieChartItemGraphicRow",
    extend: Xr.data.GraphicRow,
    requires: [Xr.data.IGraphicRow, Xr.IHitTest],

    construct: function (id, /* PieChartItemShapeData */ graphicData) {
        Xr.data.GraphicRow.call(this, id, graphicData.clone());

        var cntValues = graphicData.data().values.length;

        this._brushSymbols = [];
        this._penSymbol = new Xr.symbol.PenSymbol();

        for (var i = 0; i < cntValues; i++) {
            this._brushSymbols.push(new Xr.symbol.BrushSymbol());
        }

        var xmlns = Xr.CommonStrings.SVG_NAMESPACE;
        this._selfSvg = document.createElementNS(xmlns, "g");
        
        this._coordMapper = undefined;
    },

    methods: {
        /* PenSymbol */ penSymbol: function (/* optional PenSymbol */ penSymbol) {
            if (arguments.length == 1) {
                this._penSymbol = penSymbol;
            } else {
                return this._penSymbol;
            }
        },

        /* BrushSymbol */ brushSymbol: function (/* int */ index, /* optional BrushSymbol */ brushSymbol) {
            if (arguments.length == 2) {
                this._brushSymbols[index] = brushSymbol;
            } else {
                return this._brushSymbols[index];
            }
        },

        MBR: function (/* CoordMapper */ coordMapper, /* SVG Element */ container) {
            var data = this.graphicData().data();
            var radius = data.radiusOut;
            var cx = data.x;
            var cy = data.y;

            this._graphicData.MBR().set(cx - radius, cy - radius, cx + radius, cy + radius);

            return this._graphicData.MBR();
        },

        getPathData: function (x, y, radiusIn, radiusOut, startAngle, endAngle) {
            function _toXY(cX, cY, r, degrees) {
                var rad = (degrees) * Math.PI / 180.0;

                return {
                    x: cX + (r * Math.cos(rad)),
                    y: cY + (r * Math.sin(rad))
                };
            };

            var startIn = _toXY(x, y, radiusIn, endAngle);
            var endIn = _toXY(x, y, radiusIn, startAngle);

            var startOut = _toXY(x, y, radiusOut, endAngle);
            var endOut = _toXY(x, y, radiusOut, startAngle);

            var arcSweep = (endAngle - startAngle) <= 180 ? "0" : "1";

            var d = [
                "M", startIn.x, startIn.y,
                "L", startOut.x, startOut.y,
                "A", radiusOut, radiusOut, 0, arcSweep, 0, endOut.x, endOut.y,
                "L", endIn.x, endIn.y,
                "A", radiusIn, radiusIn, 0, arcSweep, 1, startIn.x, startIn.y,
                "z"
            ].join(" ");

            return d;
        },

        /* SVG Element */ appendSVG: function (/* CoordMapper */ coordMapper, /* SVG Element */ container) {
            var xmlns = Xr.CommonStrings.SVG_NAMESPACE;
            var data = this.graphicData().data();
            var g = this._selfSvg;//document.createElementNS(xmlns, "g");
            var values = data.values;
            var radiusOut = data.radiusOut;
            var radiusIn = data.radiusIn;
            var cntValues = values.length;

            while (g.lastChild) {
                g.removeChild(g.lastChild);
            }

            var totalValue = 0;
            for (var i = 0; i < cntValues; i++) {
                totalValue += values[i];
            }

            // Shadow
            var shadowRc = document.createElementNS(xmlns, "path");

            shadowRc.setAttribute("d", this.getPathData(0, 0, radiusIn, radiusOut, 0, 359.9999));

            shadowRc.setAttribute("fill-opacity", 0.7);

            var filter = document.createElementNS(xmlns, "filter");
            filter.setAttribute("id", "_fe_labelBlur");

            var blur = document.createElementNS(xmlns, "feGaussianBlur");
            blur.setAttribute("stdDeviation", 2.5);

            filter.appendChild(blur);
            g.appendChild(filter);

            shadowRc.setAttribute("filter", "url(#_fe_labelBlur)");

            g.appendChild(shadowRc);
            //

            var startAngle = 0;
            for (var i = 0; i < cntValues; i++) {
                var degree = (values[i] / totalValue) * 359.999;
                var path = document.createElementNS(xmlns, "path");

                path.setAttribute("d", this.getPathData(0, 0, radiusIn, radiusOut, startAngle, startAngle + degree));
                startAngle += degree;

                this.penSymbol().attribute(path);
                this.brushSymbol(i).attribute(path);
                
                g.appendChild(path);
            }

            var vp = coordMapper.W2V(new Xr.PointD(data.x, data.y));

            g.setAttribute("transform", "translate(" + vp.x + "," + vp.y + ")");
            container.appendChild(g);
            this._coordMapper = coordMapper;

            return g;
        }
    }
});