Xr.layers = Xr.layers || {};

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

        this._coordMapper = undefined;
    },
 	
    methods: {
        /* abstract */ connect: function (/* CoordMapper */ coordMapper) { },
        /* abstract */ update: function (/* CoordMapper */ coordMapper, /* MouseAction enum */ mouseAction, /* number */ offsetX, /* number */ offsetY) { },

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