Xr.layers = Xr.layers || {};

Xr.layers.ShapeMapLayer = Xr.Class({
    name: "ShapeMapLayer",
    extend: Xr.layers.Layer,
    requires: [Xr.layers.ILayer, Xr.edit.ISnap],

    construct: function(name, opt) {
        if(!opt.url) throw new Error("ShapeMapLayer requires url option.");
		
        var connectionString = opt.url;
        var newConnectionString = connectionString.replace("layerName=", "CnGD|N|");
        this._queryUrlPrefix = connectionString.replace("layerName=", "RqGD|N|") + "|";
				
        //this.superclass(name, connectionString);
        Xr.layers.Layer.call(this, name, newConnectionString);

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

        this._coordMapper = undefined;
        this._bAlwaysNeedAttribute = false;
    },
 	
    methods: {
        /* IShapeDrawTheme */ theme: function (/* optional IShapeDrawTheme */v) {
            if (arguments.length == 0) {
                return this._theme;
            } else {
                this._theme = v;
            }
        },

        /* SVG */ container: function() {
            return this._svg;
        },

        reset: function() {
            this.shapeRowSet().reset();
            this.attributeRowSet().reset();
        },

        connect: function(/* CoordMapper */ coordMapper) { 
            var url = this.connectionString();
            var req = new Xr.layers.ShapeMapConnectionRequest(url, onConnectionCompleted);
            req.request();

            this._coordMapper = coordMapper;

            var caller = this;
            function onConnectionCompleted() {		
                var vectorType = req.vectorType();
				
                var shapeType;
                if(vectorType == 65) shapeType = Xr.data.ShapeType.POLYGON;
                else if(vectorType == 112) shapeType = Xr.data.ShapeType.POINT;
                else if(vectorType == 76) shapeType = Xr.data.ShapeType.POLYLINE;
				
                caller._recordCount = req.recordCount();
                caller._fieldCount = req.fieldCount();		
                caller._mbr = req.MBR();
                caller._connected = true;
				
                caller._shapeRowSet = new Xr.data.ShapeRowSet(shapeType);
				
                var fieldSet = req.fieldSet();
                caller._attributeRowSet = new Xr.data.AttributeRowSet(fieldSet);
				
                //alert(caller._mbr);
            }
        },

        update: function(/* CoordMapper */ coordMapper, /* MouseAction enum */ mouseAction, /* number */ offsetX, /* number */ offsetY) {
            var mapScale = coordMapper.mapScale();
            //if (isNaN(mapScale)) return;

            if (this.visibility().needRendering(mapScale) || (this.label().enable() && this.label().visibility().needRendering(mapScale))) {
                var svg = this.container();
                var childNodes = svg.childNodes;
                var cntChildNodes = childNodes.length;
                var childNode;

                if (mouseAction == Xr.MouseActionEnum.MOUSE_DOWN) {
                    //.
                } else if (mouseAction == Xr.MouseActionEnum.MOUSE_DRAG) {
                    var shpRows = this.shapeRowSet().rows();			
                    for (var i = 0; i < cntChildNodes; i++) {
                        childNode = childNodes[i];

                        var row = shpRows[childNode.id]
                        if (row) {
                            childNode.setAttribute("transform", "translate(" + offsetX + "," + offsetY + ")");
                        }
                    }
                } else {
                    var vMBR = coordMapper.viewportMBR();
                    var bAttribute = this.needAttribute();
                    var url = this._queryUrlPrefix + vMBR.minX + "|" + vMBR.minY + "|" + vMBR.maxX + "|" + vMBR.maxY + "|" + (bAttribute?"Y":"N") + "|null";
                    
                    var caller = this;
                    function onQueryRequestCompleted() {
                        var mapContainer = caller.container().parentNode;
                        if (mapContainer) {
                            var e = Xr.Events.create(Xr.Events.LayerUpdateCompleted, { layerName: caller.name() });
                            Xr.Events.fire(mapContainer, e);
                        }
                    }

                    var req = new Xr.layers.ShapeMapQueryRequest(url, this, coordMapper, mouseAction, onQueryRequestCompleted);

                    console.log(url);
                    req.request();
                }
            } else {
                var childNodes = this._svg.childNodes;
                var cntChildNodes = childNodes.length;

                for (var i = 0; i < cntChildNodes; i++) {
                    childNode = childNodes[0];
                    this._svg.removeChild(childNode);
                }

                this.labelDrawer().clean(this.name());
            }
        },
		
        /* MBR */ MBR: function() {
            return this._mbr;
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

	    /* boolean */ needAttribute: function (/* optional boolean bAlwaysNeedAttribute */ bAlwaysNeedAttribute) {
	        if (arguments.length == 0) {
	            return this._label.enable() || this._theme.needAttribute() || this._bAlwaysNeedAttribute;
	        } else {
	            this._bAlwaysNeedAttribute = bAlwaysNeedAttribute;
	        }
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
	        //var coord = cm.V2W(mouseX, mouseY);
	        //var container = this._svg;
	        var shpRows = this.shapeRowSet().rows();
	        for (var id in shpRows) {
	            row = shpRows[id];
	            if (row.shapeData().hitTest(mouseX, mouseY, cm)) {
	                result.push(id);
	                if (bOnlyOne) break;
	            }
	        }

	        return result;
	    },

	    /* boolean */ hilighting: function (/* int */ id, /* optional float */ delay) {
	        var element = this.container().getElementById(id);
	        if (element) {
	            element.style.animationDuration = "0.2s";

	            if (delay) {
	                element.style.animationDuration = delay + "s";
	            }

	            element.style.animationIterationCount = 10;
	            element.style.animationDirection = "alternate";
	            element.style.animationName = "kf_hilighting";
                return true;
	        } else {
	            return false;
	        }
	    }
	}
});