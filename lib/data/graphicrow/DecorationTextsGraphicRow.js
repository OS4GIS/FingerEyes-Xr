Xr.data = Xr.data || {};

/**
 * @classdesc 여러개의 텍스트를 박스 장식과 함게 표현하는 Graphic Row에 대한 클래스입니다. 
 * @class
 * @param {int} id - Row에 대한 고유 ID
 * @param {Xr.data.DecorationTextsShapeData} graphicData - 라이브 텍스트 객체 그래픽 데이터에 대한 객체
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */

Xr.data.DecorationTextsGraphicRow = Xr.Class({
    name: "DecorationTextsGraphicRow",
    extend: Xr.data.GraphicRow,
    requires: [Xr.data.IGraphicRow, Xr.IHitTest],

    construct: function (id, /* DecorationTextsShapeData */ graphicData) {
        Xr.data.GraphicRow.call(this, id, graphicData.clone());

        var cntTexts = graphicData.data().texts.length;

        this._penSymbolForTextBox = [];
        this._brushSymbolForTextBox = [];
        this._fontSymbolForText = [];

        for (var i = 0; i < cntTexts; i++) {
            this._penSymbolForTextBox.push(new Xr.symbol.PenSymbol());
            this._brushSymbolForTextBox.push(new Xr.symbol.BrushSymbol());
            this._fontSymbolForText.push(new Xr.symbol.FontSymbol());
        }

        var xmlns = Xr.CommonStrings.SVG_NAMESPACE;
        this._selfSvg = document.createElementNS(xmlns, "g");
        
        this._coordMapper = undefined;
    },

    methods: {
        margin: function (/* optional int */ v) {
            if (arguments.length == 1) {
                this._margin = v;
            } else {
                return this._margin;
            }
        },

        /* PenSymbol */ penSymbol: function (/* int */ index, /* optional PenSymbol */ penSymbol) {
            if (arguments.length == 2) {
                this._penSymbolForTextBox[index] = penSymbol;
            } else {
                return this._penSymbolForTextBox[index];
            }
        },

        /* BrushSymbol */ brushSymbol: function (/* int */ index, /* optional BrushSymbol */ brushSymbol) {
            if (arguments.length == 2) {
                this._brushSymbolForTextBox[index] = brushSymbol;
            } else {
                return this._brushSymbolForTextBox[index];
            }
        },

        /* FontSymbol */ fontSymbol: function (/* int */ index, /* optional FontSymbol */ fontSymbol) {
            if (arguments.length == 2) {
                this._fontSymbolForText[index] = fontSymbol;
            } else {
                return this._fontSymbolForText[index];
            }
        },

        MBR: function (/* CoordMapper */ coordMapper, /* SVG Element */ container) {
            //var svg = 
            this.appendSVG(coordMapper, container);
            //container.appendChild(svg);
            
            //var bBox = svg.getBBox();
            var bBox = this._selfSvg.getBBox();

            //container.removeChild(svg);
            // ->
            while (this._selfSvg.lastChild) {
                this._selfSvg.removeChild(this._selfSvg.lastChild);
            }
            // .

            var minXY = coordMapper.V2W(bBox.x, bBox.y + bBox.height);
            var maxXY = coordMapper.V2W(bBox.x + bBox.width, bBox.y);

            this._graphicData.MBR().set(minXY.x, minXY.y, maxXY.x, maxXY.y);

            return this._graphicData.MBR();
        },
        
        /* SVG Element */ appendSVG: function (/* CoordMapper */ coordMapper, /* SVG Element */ container) {
            var xmlns = Xr.CommonStrings.SVG_NAMESPACE;
            var data = this.graphicData().data();
            var g = this._selfSvg;//document.createElementNS(xmlns, "g");
            var cntTexts = data.texts.length;
            
            var text_gs = [];
            var totalWidth = 0;
            var textPartsWidth = [];
            var totalHeight = 0;

            for (var i = 0; i < cntTexts; i++) {
                var text_g = document.createElementNS(xmlns, "g");
                text_gs.push(text_g);

                var text = data.texts[i];
                var strokeSvg = undefined;
                var fontSym = this.fontSymbol(i);
                
                if (fontSym.needStroke()) {
                    strokeSvg = document.createElementNS(xmlns, "text");
                    strokeSvg.setAttribute("text-anchor", "middle");
                    fontSym.attributeForStroke(strokeSvg);
                    strokeSvg.textContent = text;
                }

                var textSvg = document.createElementNS(xmlns, "text");
                textSvg.setAttribute("text-anchor", "middle");
                fontSym.attribute(textSvg);
                textSvg.textContent = text;

                // draw Box
                container.appendChild(textSvg);
                var bBox = textSvg.getBBox();
                container.removeChild(textSvg);

                var partWidth = bBox.width + 7;
                var partHeight = bBox.height + 2;

                var rc = document.createElementNS(xmlns, "rect");
                rc.setAttribute("x", totalWidth);
                rc.setAttribute("y", 0);
                rc.setAttribute("width", partWidth);
                rc.setAttribute("height", partHeight);
                rc.setAttribute('rx', 3);
                rc.setAttribute('ry', 3);
                
                textSvg.setAttribute("x", totalWidth + partWidth / 2);
                textSvg.setAttribute("y", partHeight - 4);

                this.penSymbol(i).attribute(rc);
                this.brushSymbol(i).attribute(rc);
                
                text_g.appendChild(rc);

                if (strokeSvg != undefined) {
                    strokeSvg.setAttribute("x", totalWidth + partWidth / 2);
                    strokeSvg.setAttribute("y", partHeight - 4);

                    text_g.appendChild(strokeSvg);
                }

                text_g.appendChild(textSvg);
                
                textPartsWidth.push(partWidth);
                totalWidth += partWidth;
                totalHeight = partHeight;
            }

            while (g.lastChild) {
                g.removeChild(g.lastChild);
            }

            // Shadow
            var shadowRc = document.createElementNS(xmlns, "rect");
            shadowRc.setAttribute("x", 2);
            shadowRc.setAttribute("y", 2);
            shadowRc.setAttribute("width", totalWidth);
            shadowRc.setAttribute("height", totalHeight);
            shadowRc.setAttribute('rx', 3);
            shadowRc.setAttribute('ry', 3);
            
            shadowRc.setAttribute("fill-opacity", 0.3);

            var filter = document.createElementNS(xmlns, "filter");
            filter.setAttribute("id", "_fe_labelBlur");

            var blur = document.createElementNS(xmlns, "feGaussianBlur");
            blur.setAttribute("stdDeviation", 1.5);

            filter.appendChild(blur);
            g.appendChild(filter);

            shadowRc.setAttribute("filter", "url(#_fe_labelBlur)");

            g.appendChild(shadowRc);
            //

            for (var i = 0; i < text_gs.length; i++) {
                g.appendChild(text_gs[i]);
            }

            var vp = coordMapper.W2V(new Xr.PointD(data.x, data.y));

            var offsetX = data.offsetX ? data.offsetX : 0;
            var offsetY = data.offsetY ? data.offsetY : 0;

            vp.x += offsetX - totalWidth / 2;
            vp.y += offsetY;

            g.setAttribute("transform", "translate(" + vp.x + "," + vp.y + ")");
            //g.setAttribute("x", vp.x);
            //g.setAttribute("y", vp.y);
            container.appendChild(g);
            this._coordMapper = coordMapper;

            return g;
        }
    }
});