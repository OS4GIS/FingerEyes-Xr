Xr.layers = Xr.layers || {};

/**  
 * @classdesc 서버로부터 실제 좌표값과 속성값을 받아 처리하는 레이어가 상속받는 부모 클래스입니다.
 * @class
 * @param {String} name - 레이어의 이름으로 고유한 ID 값
 * @param {String} connectionString - 연결 문자열
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.layers.CoordinateLayer = Xr.Class({
    name: "CoordinateLayer",
    extend: Xr.layers.Layer,
    requires: [Xr.layers.ILayer, Xr.edit.ISnap],

    construct: function (name, /* string */ connectionString) {
        if (arguments[0] === __XR_CLASS_LOADING_TIME__) return;

        Xr.layers.Layer.call(this, name, connectionString);
        
        this._svg = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "svg");
        this._svg.style.position = "absolute";
        this._svg.style.top = "0px";
        this._svg.style.left = "0px";
        this._svg.style.width = "100%";
        this._svg.style.height = "100%";
        this._svg.style.overflow = "hidden";
        this._svg.style.setProperty("pointer-events", "none");	

        this._vectorType = undefined;
        this._recordCount = undefined;
        this._fieldCount = undefined;		
        this._mbr = undefined;
        this._label = new Xr.Label(this);
        this._theme = new Xr.theme.SimpleShapeDrawTheme(this);
        this._connected = false;
        this._deferableTheme = null;
        this._deferableLabelText = null;

        this._coordMapper = undefined;
    },
 	
    methods: {
        /* Xr.data.ShapeType.POLYGON, POINT, POLYLINE */ shapeType: function () {
            return this._shapeRowSet.shapeType();
        },

        /* abstract */ connect: function (/* CoordMapper */ coordMapper, /* optional function */ callbackFunction) { },
        /* abstract */ update: function (/* CoordMapper */ coordMapper, /* MouseAction enum */ mouseAction, /* number */ offsetX, /* number */ offsetY) { },

        /* DeferableShapeDrawTheme */ deferableTheme: function (/* optional DeferableShapeDrawTheme */ v) {
            if (arguments.length == 0) {
                return this._deferableTheme;
            } else {
                this._deferableTheme = v;
                v.targetLayer(this);
                return this;
            }
        },

        /* DeferableShapeDrawTheme */ deferableLabelText: function (/* optional DeferableLabelText */ v) {
            if (arguments.length == 0) {
                return this._deferableLabelText;
            } else {
                this._deferableLabelText = v;
                v.targetLayer(this);
                return this;
            }
        },

        /* IShapeDrawTheme */ theme: function (/* optional IShapeDrawTheme */ v) {
            if (arguments.length == 0) {
                return this._theme;
            } else {
                this._theme = v;
                return this;
            }
        },

        /* SVG */ container: function() {
            return this._svg;
        },

        reset: function() {
            this.shapeRowSet().reset();
            this.attributeRowSet().reset();

            var container = this._svg;
            while (container.lastChild) {
                container.removeChild(container.lastChild);
            }
        },

        release: function () {
            this.reset();
        },

        /* MBR */ MBR: function() {
            return this._mbr;
        },

        needRendering: function (mapScale) {
            var label = this.label();

            return this.visibility().needRendering(mapScale) || (label.enable() && label.visibility().needRendering(mapScale));
        },

        /* boolean */ conneted: function() {
            return this._connected; 
        },
		
        /* ShapeRowSet */ shapeRowSet: function() {
            return this._shapeRowSet;
        },
		
        /* AttributeRowSet */ attributeRowSet: function() {
            return this._attributeRowSet;
        },
		
        /* FieldSet */ fieldSet: function() {
            return this._attributeRowSet.fieldSet();
        },

        /* AttributeRow */ attributeById: function(/* int */ id) {
            return this._attributeRowSet.row(id);
        },

		/*  Label */ label: function() {
			return this._label;
		},

	    /* PointD */ vertexSnap: function (/* PointD */ mapPt, /* number */ tol) {
	        var shpRows = this.shapeRowSet().rows();
	        var shpRow = undefined;
	        var shpData = undefined;
	        var result = undefined;

	        for (var fid in shpRows) {
	            shpRow = shpRows[fid];
	            shpData = shpRow.shapeData();
	            result = shpData.vertexSnap(mapPt, tol);
	            if (result) break;
	        }

	        return result;
	    },

	    /* PointD */ edgeSnap: function (/* PointD */ mapPt, /* number */ tol) {
	        var shpRows = this.shapeRowSet().rows();
	        var shpRow = undefined;
	        var shpData = undefined;
	        var result = undefined;

	        for (var fid in shpRows) {
	            shpRow = shpRows[fid];
	            shpData = shpRow.shapeData();
	            result = shpData.edgeSnap(mapPt, tol);
	            if (result) break;
	        }

	        return result;
	    },

	    /* Array */ IdByMousePoint: function (/* number*/ mouseX, /* number */ mouseY, /* boolean */ bOnlyOne) {
	        var result = new Array();
	        var cm = this._coordMapper;
	        var shpRows = this.shapeRowSet().rows();

	        if (this.shapeType() == Xr.data.ShapeType.POINT) {
	            var theme = this.theme();
	            var fieldSet = this.attributeRowSet().fieldSet();
	            var attRows = this.attributeRowSet().rows();

	            for (var id in shpRows) {
	                var row = shpRows[id];
	                var arow = attRows[id];
	                var markertSym = theme.symbol(row, fieldSet, arow).markerSymbol();
                    
	                if (row.shapeData().hitTest(mouseX, mouseY, cm, markertSym)) {
	                    result.push(id);
	                    if (bOnlyOne) break;
	                }
	            }
	        } else {
    	        for (var id in shpRows) {
	                var row = shpRows[id];
	                if (row.shapeData().hitTest(mouseX, mouseY, cm)) {
	                    result.push(id);
	                    if (bOnlyOne) break;
	                }
                }
            }

	        return result;
	    },

	    /* boolean */ hilighting: function (/* int */ id, /* optional float */ delay) {
	        var element = this.container().getElementById(id);
	        if (element) {
                // Old Method
	            /*
	            element.style.animationDuration = "0.2s";

	            if (delay) {
	                element.style.animationDuration = delay + "s";
	            }

	            element.style.animationIterationCount = 10;
	            element.style.animationDirection = "alternate";
	            element.style.animationName = "kf_hilighting";
                //*/

                // New Method
                //*
                var newone = element.cloneNode(true);

                newone._offsetX = element._offsetX;
                newone._offsetY = element._offsetY;

	            newone.style.animationDuration = "0.2s";

	            if (delay) {
	                newone.style.animationDuration = delay + "s";
	            }

	            newone.style.animationIterationCount = 7;
	            newone.style.animationDirection = "alternate";
	            newone.style.animationName = "kf_hilighting";

	            element.parentNode.replaceChild(newone, element);
	            //*/

                return true;
	        } else {
	            return false;
	        }
        },

        _drawImageMarkerSymbolOnCanvas: function (/* canvas DOM */ canvas) {
            var coordMapper = this._coordMapper;
            var attRowSet = this.attributeRowSet();
            var fieldSet = attRowSet.fieldSet();
            var attRows = attRowSet.rows();
            var theme = this.theme();
            var mapScale = coordMapper.mapScale();
            var shpRows = this.shapeRowSet().rows();
            var shpType = this.shapeRowSet().shapeType();
            var bShpDraw = this.visibility().needRendering(mapScale);

            var ctx = canvas.getContext("2d");

            if (bShpDraw && shpType === Xr.data.ShapeType.POINT) {
                if (theme instanceof Xr.theme.SimpleShapeDrawTheme) {
                    for (var fid in shpRows) {
                        var shpRow = shpRows[fid];
                        var attRow = attRows[fid];

                        var sym = theme.symbol(shpRow, fieldSet, attRow);
                        if (sym === null || !(sym instanceof Xr.symbol.ShapeDrawSymbol)) {
                            continue;
                        }

                        var markerSym = sym.markerSymbol();
                        if (!(markerSym instanceof Xr.symbol.ImageMarkerSymbol)) {
                            continue;
                        }

                        var point = shpRow.shapeData().data();
                        var vp = coordMapper.W2V(point);
                        var w = markerSym.width();
                        var h = markerSym.height();

                        ctx.drawImage(markerSym.image(), vp.x - (w / 2), vp.y - (h / 2), w, h);
                    }
                }
            }
        },
        
        drawOnCanvas: function (/* canvas DOM */ canvas) {
            var ctx = canvas.getContext("2d");

            if (this.shapeType() === Xr.data.ShapeType.POINT) {
                var theme = this.theme();
                if (theme instanceof Xr.theme.SimpleShapeDrawTheme) {
                    var sym = theme.symbol(null, null, null);
                    if (sym instanceof Xr.symbol.ShapeDrawSymbol) {
                        if (sym.markerSymbol() instanceof Xr.symbol.ImageMarkerSymbol) {
                            this._drawImageMarkerSymbolOnCanvas(canvas);
                            return;
                        }
                    }
                }
            }

            var domSvg = this.container();
            var svgString = new XMLSerializer().serializeToString(domSvg);

            var img = new Image();

            img.onload = function (img) {
                return function () {
                    ctx.drawImage(img, 0, 0);
                };
            }(img);

            //img.setAttribute("crossOrigin", "anonymous");
            img.src = "data:image/svg+xml;base64," + btoa(svgString);
        }
	}
});