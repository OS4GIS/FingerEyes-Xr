Xr.layers = Xr.layers || {};

Xr.layers.ShapeMapLayer = Xr.Class({
    name: "ShapeMapLayer",
    extend: Xr.layers.CoordinateLayer,

    construct: function(name, opt) {
        if(!opt.url) throw new Error("ShapeMapLayer requires url option.");
        var connectionString = opt.url;
        var newConnectionString = connectionString.replace("layerName=", "CnGD|N|");
        this._queryUrlPrefix = connectionString.replace("layerName=", "RqGD|N|") + "|";

        this.superclass(name, newConnectionString);
        //Xr.layers.CoordinateLayer.call(this, name, newConnectionString);

        this._bAlwaysNeedAttribute = false;
    },
 	
    methods: {
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
                    //console.log(url);
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
		
	    /* boolean */ needAttribute: function (/* optional boolean bAlwaysNeedAttribute */ bAlwaysNeedAttribute) {
	        if (arguments.length == 0) {
	            return this._label.enable() || this._theme.needAttribute() || this._bAlwaysNeedAttribute;
	        } else {
	            this._bAlwaysNeedAttribute = bAlwaysNeedAttribute;
	        }
	    },
	}
});