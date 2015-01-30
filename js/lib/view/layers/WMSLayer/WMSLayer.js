Xr.layers = Xr.layers || {};

Xr.layers.WMSLayer = Xr.Class({
    name: "WMSLayer",
    extend: Xr.layers.Layer,
    requires: [Xr.layers.ILayer],

    construct: function (/* String */ name, /* Object */ params) {
        this.superclass(name, undefined);
        //Xr.layers.Layer.call(this, name, undefined);

        this._div = document.createElement("div");
        this._div.style.position = "absolute";
        this._div.style.top = "0px";
        this._div.style.left = "0px";
        this._div.style.border = "none";
        this._div.style.width = "100%";
        this._div.style.height = "100%";
        this._div.style.overflow = "hidden";
        this._div.style.setProperty("pointer-events", "none");

        this._img = document.createElement("img");
        this._img.style.position = "absolute";
        this._img.style.setProperty("pointer-events", "none");
        this._img.style.setProperty("user-select", "none");
        this._img.style.overflow = "hidden";
        //this._img.style.display = "none";
        
        this.container().appendChild(this._img);

        this._params = params;

        this._connected = params.url != undefined && params.layers != undefined && params.srs != undefined;

        this._coordMapper = undefined;

        // [ToDo] get real MBR from service for WMS.
        this._mbr = new Xr.MBR(Number.MIN_VALUE, Number.MIN_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
    },

    methods: {
        /* DIV */ container: function () {
            return this._div;
        },

        connect: function (/* CoordMapper */ coordMapper) {
            this._coordMapper = coordMapper;
        },

        refresh: function () {
            this.update(this._coordMapper);
        },

        _getFullUrl: function () {
            var cm = this._coordMapper;
            var mbr = cm.viewportMBR();
            var width = cm.viewWidth();
            var height = cm.viewHeight();
            var params = this._params;
            var url = params.url;
            var queryString = "request=GetMap" + "&width=" + width + "&height=" + height +
                "&bbox=" + mbr.minX + "," + mbr.minY + "," + mbr.maxX + "," + mbr.maxY;

            for (var p in params) {
                if (params.hasOwnProperty(p) && p != "url") {
                    queryString += "&" + p + "=" + params[p];
                }
            }

            return url + "?" + encodeURI(queryString);
        },

        update: function (/* CoordMapper */ coordMapper, /* MouseAction enum */ mouseAction, /* number */ offsetX, /* number */ offsetY) {
            var mapScale = coordMapper.mapScale();
            //if (isNaN(mapScale)) return;

            if (this.visibility().needRendering(mapScale)) {
                this._div.style.display = "block";

                if (mouseAction == Xr.MouseActionEnum.MOUSE_DOWN) {
                    this._previousImgLeft = Xr.OperationHelper.valueFromPx(this._img.style.left);
                    this._previousImgTop = Xr.OperationHelper.valueFromPx(this._img.style.top);
                } else if (mouseAction == Xr.MouseActionEnum.MOUSE_DRAG) {
                    var left = Xr.OperationHelper.valueFromPx(this._img.style.left);
                    var top = Xr.OperationHelper.valueFromPx(this._img.style.top);

                    this._img.style.top = this._previousImgTop + offsetY;
                    this._img.style.left = this._previousImgLeft + offsetX;
                } else {
                    if (!this._img.onload) {
                        var that = this;
                        this._img.onload = function () {
                            var cm = that._coordMapper;
                            var mbr = cm.viewportMBR();

                            that._img.style.setProperty("-webkit-transform-origin", "0px 0px");
                            that._img.style.setProperty("-webkit-transform", "rotate(" + cm.rotationAngle() + "deg)");

                            that._img.style.setProperty("transform-origin", "0px 0px");
                            that._img.style.setProperty("transform", "rotate(" + cm.rotationAngle() + "deg)");

                            //that._img.style.setProperty("transform-origin", "0px 0px");
                            //that._img.style.transform = "rotate(" + cm.rotationAngle() + "deg)";

                            var lt = cm.W2V(new Xr.PointD(mbr.minX, mbr.maxY));
                            var rb = cm.W2V(new Xr.PointD(mbr.maxX, mbr.minY));
                            var rt = cm.W2V(new Xr.PointD(mbr.maxX, mbr.maxY));

                            that._img.style.top = Math.floor(lt.y);// + "px";
                            that._img.style.left = Math.floor(lt.x);// + "px";

                            that._img.style.width = Math.ceil(Math.sqrt(Math.pow(lt.x - rt.x, 2.0) + Math.pow(lt.y - rt.y, 2.0)));// + "px";
                            that._img.style.height = Math.ceil(Math.sqrt(Math.pow(rt.x - rb.x, 2.0) + Math.pow(rt.y - rb.y, 2.0)));// + "px";
                        };
                    }


                    var url = this._getFullUrl();
                    this._img.setAttribute("src", url);

                    var mapContainer = this.container().parentNode;
                    if (mapContainer) {
                        var e = Xr.Events.create(Xr.Events.LayerUpdateCompleted, { layerName: this.name() });
                        Xr.Events.fire(mapContainer, e);
                    }
                }
            } else { // Need not draw
                this._div.style.display = "none";
            }
        },

        /* MBR */ MBR: function () {
            return this._mbr;
        },

        /* boolean */ conneted: function () {
            return this._connected;
        },
    }
});