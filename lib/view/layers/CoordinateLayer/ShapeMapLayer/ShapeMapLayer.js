Xr.layers = Xr.layers || {};

/**  
 * @classdesc Custom Format 형태의 공간 데이터를 사용하는 수치지도 레이어에 대한 클래스입니다.
 * @class
 * @param {String} name - 레이어의 이름으로 고유한 ID 값
 * @param {Object} opt - 레이어에 대한 옵션을 담기 위한 객체
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
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
        this._EPSG = -1;
    },
 	
    methods: {
        /* boolean */ EPSG: function (/* optional int */ epsgCode) {
            if (arguments.length == 0) {
                return this._EPSG;
            } else {
                this._EPSG = epsgCode;
                return this;
            }
        },

        connect: function (/* CoordMapper */ coordMapper, /* optional function */ callbackFunction) { 
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

                if (callbackFunction) {
                    callbackFunction(caller);
                }

                //alert(caller._mbr);
            }
        },
        
        update: function(/* CoordMapper */ coordMapper, /* MouseAction enum */ mouseAction, /* number */ offsetX, /* number */ offsetY) {            
            var mapScale = coordMapper.mapScale();
            //if (isNaN(mapScale)) return;

            var svg = this.container();

            if (this.visibility().needRendering(mapScale) || (this.label().enable() && this.label().visibility().needRendering(mapScale))) {
                if (svg.style.display != "block") svg.style.display = "block"

                var childNodes = svg.childNodes;
                var cntChildNodes = childNodes.length;
                var childNode;

                if (mouseAction == Xr.MouseActionEnum.MOUSE_DOWN) {
                    //.
                } else if (mouseAction == Xr.MouseActionEnum.MOUSE_DRAG) {

                    /* !!
                    var shpRows = this.shapeRowSet().rows();
                    var row;
                    for (var i = 0; i < cntChildNodes; i++) {
                        childNode = childNodes[i];

                        row = shpRows[childNode.id]
                        if (row) {
                            childNode.setAttribute("transform", "translate(" + offsetX + "," + offsetY + ")");
                        }
                    }
                    */

                    svg.style.top = offsetY + "px"; //!!
                    svg.style.left = offsetX + "px"; //!!

                    //console.log("[1] " + offsetX + " " + offsetY);
                } else {
                    var vMBR = coordMapper.viewportMBR();
                    if (vMBR.isInvalid()) {
                        return;
                    }

                    var bAttribute = this.needAttribute();
                    var nEPSGCode = this._EPSG; /* 5179(자체 기본맵, 네이버맵), 5181(다음카카오맵), 3857(구글맵, VWorld맵) */
                    var url = this._queryUrlPrefix + vMBR.minX + "|" + vMBR.minY + "|" + vMBR.maxX + "|" + vMBR.maxY + "|" + (bAttribute ? "Y" : "N") + "|null|" + nEPSGCode;

                    // -> 갑작스러운 지도 이동에 옳바르지 않은 위치에 도형 표시되는 것 방지
                    if (mouseAction != Xr.MouseActionEnum.MOUSE_DRAG_END) {
                        var svg = this._svg;
                        while (svg.lastChild) {
                            svg.removeChild(svg.lastChild);
                        }

                        this.labelDrawer().clean(this.name(), true);
                    }
                    // <-

                    // !! ->
                    if (mouseAction && mouseAction != Xr.MouseActionEnum.NO_MOUSE) {
                        svg.style.top = 0;
                        svg.style.left = 0;
                        
                        var srs = this.shapeRowSet();
                        if (!srs) return;

                        cntChildNodes = childNodes.length;
                        var shpRows = srs.rows();
                        var row;
                        for (var i = 0; i < cntChildNodes; i++) {
                            childNode = childNodes[i];

                            row = shpRows[childNode.id]
                            if (row) {
                                childNode._offsetX += offsetX;
                                childNode._offsetY += offsetY;

                                childNode.setAttribute("transform",
                                    "translate(" + childNode._offsetX + "," + childNode._offsetY + ")");
                            }
                        }
                    }
                    // <- !!

                    var caller = this;
                    function onQueryRequestCompleted() {
                        var mapContainer = caller.container().parentNode;
                        if (mapContainer) {
                            var e = Xr.Events.create(Xr.Events.LayerUpdateCompleted, { layerName: caller.name() });
                            Xr.Events.fire(mapContainer, e);
                        }
                    }

                    url += "|" + new Date().getTime(); // NO-CACHE

                    //* // NEW
                    var prevReq = this._req;
                    if (prevReq) {
                        prevReq.cancel();
                    }

                    var newReq = new Xr.layers.ShapeMapQueryRequest(url, this, coordMapper, mouseAction, onQueryRequestCompleted);
                    newReq.request();
                    this._req = newReq;
                    //*/

                    /* // OLD
                    var req = new Xr.layers.ShapeMapQueryRequest(url, this, coordMapper, mouseAction, onQueryRequestCompleted);
                    req.request();
                    */

                    //console.log("[2] " + offsetX + " " + offsetY);
                }
            } else {
                if (svg.style.display != "none") svg.style.display = "none";

                while (svg.lastChild) {
                    svg.removeChild(svg.lastChild);
                }

                this.labelDrawer().clean(this.name());

                //console.log("[3] " + offsetX + " " + offsetY);
            }
        },
		
	    /* boolean */ needAttribute: function (/* optional boolean */ bAlwaysNeedAttribute) {
	        if (arguments.length == 0) {
	            return this._label.enable() || this._theme.needAttribute() || this._bAlwaysNeedAttribute;
	        } else {
	            this._bAlwaysNeedAttribute = bAlwaysNeedAttribute;
	            return this;
	        }
	    },
	}
});