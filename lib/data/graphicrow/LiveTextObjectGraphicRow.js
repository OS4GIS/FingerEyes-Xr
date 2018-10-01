Xr.data = Xr.data || {};

/**
 * @classdesc 주기적으로 데이터를 가져와 텍스트와 Box로 그래픽을 표현하는 Graphic Row에 대한 클래스입니다. 
 * @class
 * @param {int} id - Row에 대한 고유 ID
 * @param {Xr.data.LiveTextObjectShapeData} graphicData - 라이브 텍스트 객체 그래픽 데이터에 대한 객체
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */

Xr.data.LiveTextObjectGraphicRow = Xr.Class({
    name: "LiveTextObjectGraphicRow",
    extend: Xr.data.GraphicRow,
    requires: [Xr.data.IGraphicRow, Xr.IHitTest],

    construct: function (id, /* LiveTextObjectShapeData */ graphicData, /* GraphicLayer */ gl) {
        Xr.data.GraphicRow.call(this, id, graphicData.clone());

        this._penSymbol = new Xr.symbol.PenSymbol();
        this._brushSymbol = new Xr.symbol.BrushSymbol();
        this._fontSymbol = new Xr.symbol.FontSymbol();

        this._targetLayer = gl;
        this._container = gl.container();

        var xmlns = Xr.CommonStrings.SVG_NAMESPACE;
        this._selfSvg = document.createElementNS(xmlns, "g");
        
        this._coordMapper = undefined;
        this._bStopMode = true;
        this._httpRequest = null;
    },

    methods: {
        /* GraphicLayer */ targetLayer: function() {
            return this._targetLayer;
        },

        /* void */ start: function () {
            this.stop();
            this._bStopMode = false;

            var data = this.graphicData().data();
            var period = data.period ? data.period : 5000; 

            this._timerId = setTimeout(this._onTimer, period, this);
        },

        /* void */ stop: function () {
            this._bStopMode = true;

            if (this._timerId) {
                clearTimeout(this._timerId);
            }

            if (this._httpRequest) {
                this._httpRequest.abort();
            }
        },

        _onTimer: function (that) {
            if (this._bStopMode) {
                //console.log('Stop Mode, so I am Stop.');
                return;
            }

            var data = that.graphicData().data();
            var url = data.url;

            if (!that._httpRequest) that._httpRequest = Xr.OperationHelper.createXMLHttpObject();
            var httpRequest = that._httpRequest;

            httpRequest.onreadystatechange = onReadyStateChange;
            httpRequest.open('GET', url);
            httpRequest.send();
            
            function onReadyStateChange() {
                if (httpRequest.readyState == 4) {
                    if (httpRequest.status == 200) {
                        var e = Xr.Events.create(Xr.Events.LiveGraphicRowRequestCompleted, { targetRow: that, xhr: that._httpRequest });
                        Xr.Events.fire(that._selfSvg, e);
                    } else {
                        var e = Xr.Events.create(Xr.Events.LiveGraphicRowRequestError, { targetRow: that });
                        Xr.Events.fire(that._selfSvg, e);
                    }

                    //if (!Xr.UserState.mouseDrag) {
                    if (that._coordMapper.mouseState.bDrag) {
                        that.refresh();
                    }

                    if (!that._bStopMode) {
                        that.start();
                    }
                }
            }
        },

        /* PenSymbol */ penSymbol: function (/* optional PenSymbol */ penSymbol) {
            if (arguments.length == 1) {
                this._penSymbol = penSymbol;
            } else {
                return this._penSymbol;
            }
        },

        /* BrushSymbol */ brushSymbol: function (/* optional BrushSymbol */ brushSymbol) {
            if (arguments.length == 1) {
                this._brushSymbol = brushSymbol;
            } else {
                return this._brushSymbol;
            }
        },

        /* FontSymbol */ fontSymbol: function (/* optional FontSymbol */ fontSymbol) {
            if (arguments.length == 1) {
                this._fontSymbol = fontSymbol;
            } else {
                return this._fontSymbol;
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

        refresh: function () {
            if (this._bStopMode) {
                console.log('Stop Mode, so I am Stop. 2');
                return;
            }

            var c = this._container;
            var s = this._selfSvg;
            var m = this._coordMapper;

            if (c && s && m) {
                try {
                    c.removeChild(s);
                    this.appendSVG(m, c);
                } catch (e) { // Not Found Error
                    console.log('Not Found Error');
                }
            }
        },

        /* SVG Element */ appendSVG: function (/* CoordMapper */ coordMapper, /* SVG Element */ container) {
            //this.graphicData().regenMBR(coordMapper, this._fontSymbol);

            if (this._bStopMode) {
                console.log('Stop Mode, so I am Stop. 3');
                return;
            }

            var xmlns = Xr.CommonStrings.SVG_NAMESPACE;
            var data = this.graphicData().data();
            var text = data.text;
            var vp = coordMapper.W2V(new Xr.PointD(data.x, data.y));
            var g = this._selfSvg;//document.createElementNS(xmlns, "g");

            g.setAttribute("transform", "translate(0, 0)");

            while (g.lastChild) {
                g.removeChild(g.lastChild);
            }

            var strokeSvg = undefined;

            var offsetX = data.offsetX ? data.offsetX : 0;
            var offsetY = data.offsetY ? data.offsetY : 0;

            vp.x += offsetX;
            vp.y += offsetY;

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

            // draw Box
            container.appendChild(textSvg);
            var bBox = textSvg.getBBox();
            container.removeChild(textSvg);

            var boxX = bBox.x - 1 - 5;
            var boxY = bBox.y - 1 - 1;

            var rc = document.createElementNS(xmlns, "rect");
            rc.setAttribute("x", boxX);
            rc.setAttribute("y", boxY);
            rc.setAttribute("width", bBox.width + 10);
            rc.setAttribute("height", bBox.height + 4);
            rc.setAttribute('rx', 4);
            rc.setAttribute('ry', 4);

            var shadowRc = rc.cloneNode();
            shadowRc.setAttribute("x", boxX + 2);
            shadowRc.setAttribute("y", boxY + 2);
            shadowRc.setAttribute("fill-opacity", 0.5);

            this._penSymbol.attribute(rc);
            this._brushSymbol.attribute(rc);
            
            //
            var filter = document.createElementNS(xmlns, "filter");
            filter.setAttribute("id", "_fe_labelBlur");

            var blur = document.createElementNS(xmlns, "feGaussianBlur");
            blur.setAttribute("stdDeviation", 1.5);

            filter.appendChild(blur);
            g.appendChild(filter);

            shadowRc.setAttribute("filter", "url(#_fe_labelBlur)");
            //g.appendChild(strokeSvg);
            //

            g.appendChild(shadowRc);
            g.appendChild(rc);
            // .

            if (strokeSvg != undefined) {
                var filter = document.createElementNS(xmlns, "filter");
                filter.setAttribute("id", "_fe_labelBlur");

                var blur = document.createElementNS(xmlns, "feGaussianBlur");
                blur.setAttribute("stdDeviation", "1.5");

                filter.appendChild(blur);
                g.appendChild(filter);

                strokeSvg.setAttribute("filter", "url(#_fe_labelBlur)");
                g.appendChild(strokeSvg);
            }

            g.appendChild(textSvg);

            container.appendChild(g);

            //this._selfSvg = g;
            this._coordMapper = coordMapper;

            return g;
        },

        addEventListener: function (/* eventName */ eventName, /* function */ callback, /* boolean */ useCapture) {
            //this._container.addEventListener(eventName, callback, useCapture == undefined ? false : useCapture);
            this._selfSvg.addEventListener(eventName, callback, useCapture == undefined ? false : useCapture);
        },

        removeEventListener: function (/* eventName */ eventName, /* function */ callback, /* boolean */ useCapture) {
            //this._container.removeEventListener(eventName, callback, useCapture == undefined ? false : useCapture);
            this._selfSvg.removeEventListener(eventName, callback, useCapture == undefined ? false : useCapture);
        }
    }
});