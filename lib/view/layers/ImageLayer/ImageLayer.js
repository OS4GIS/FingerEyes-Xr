Xr.layers = Xr.layers || {};

/**  
 * @classdesc 단일 이미지로부터 레이어를 구성하는 클래스입니다.
 * @class
 * @param {String} name - 레이어의 이름으로 고유한 ID 값
 * @param {Object} params - 레이어를 구성하기 위한 파라메터로써 url, minX, minY, maxX, maxY가 반드시 담겨야 합니다. 
 * @example
 * var lyr = new Xr.layers.ImageLayer(
 *     "imageLyr",
 *     {
 *         url: "http://www.gisdeveloper.co.kr:8080/download/map.png",
 *         minX: 148413,
 *         minY: 269516,
 *         maxX: 148679,
 *         maxY: 269735,
 *     }
 * );
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.layers.ImageLayer = Xr.Class({
    name: "ImageLayer",
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

        var minX = params.minX;
        var minY = params.minY;
        var maxX = params.maxX;
        var maxY = params.maxY;

        this._connected = params.url != undefined
            && minX != undefined && minY != undefined
            && maxX != undefined && maxY != undefined;

        this._coordMapper = undefined;

        this._mbr = new Xr.MBR(minX, minY, maxX, maxY);
    },

    methods: {
        /* DIV */ container: function () {
            return this._div;
        },

        connect: function (/* CoordMapper */ coordMapper, /* optional function */ callbackFunction) {
            this._coordMapper = coordMapper;

            if (callbackFunction) {
                callbackFunction(caller);
            }
        },

        refresh: function () {
            this.update(this._coordMapper);
        },
        
        update: function (/* CoordMapper */ coordMapper, /* MouseAction enum */ mouseAction, /* number */ offsetX, /* number */ offsetY) {
            var mapScale = coordMapper.mapScale();
            var div = this.container();
            //if (isNaN(mapScale)) return;

            if (this.visibility().needRendering(mapScale)) {
                if (div.style.display != "block") div.style.display = "block"

                if (mouseAction == Xr.MouseActionEnum.MOUSE_DOWN) {
                    this._previousImgLeft = Xr.OperationHelper.valueFromPx(this._img.style.left);
                    this._previousImgTop = Xr.OperationHelper.valueFromPx(this._img.style.top);
                } else if (mouseAction == Xr.MouseActionEnum.MOUSE_DRAG) {
                    var left = Xr.OperationHelper.valueFromPx(this._img.style.left);
                    var top = Xr.OperationHelper.valueFromPx(this._img.style.top);

                    this._img.style.top = this._previousImgTop + offsetY + "px";
                    this._img.style.left = this._previousImgLeft + offsetX + "px";
                } else {
                    var cm = this._coordMapper;
                    var params = this._params;
                    var minX = params.minX;
                    var minY = params.minY;
                    var maxX = params.maxX;
                    var maxY = params.maxY;

                    var lt = cm.W2V(new Xr.PointD(minX, maxY));
                    var rb = cm.W2V(new Xr.PointD(maxX, minY));
                    var rt = cm.W2V(new Xr.PointD(maxX, maxY));

                    var img = this._img;

                    if (!img.onload) {
                        var that = this;

                        img.onload = function () {
                            img.style.setProperty("-webkit-transform-origin", "0px 0px");
                            img.style.setProperty("-webkit-transform", "rotate(" + cm.rotationAngle() + "deg)");

                            img.style.setProperty("transform-origin", "0px 0px");
                            img.style.setProperty("transform", "rotate(" + cm.rotationAngle() + "deg)");

                            //img.style.setProperty("transform-origin", "0px 0px");
                            //img.style.transform = "rotate(" + cm.rotationAngle() + "deg)";

                            img.style.top = Math.floor(lt.y) + "px";
                            img.style.left = Math.floor(lt.x) + "px";

                            img.style.width = Math.ceil(Math.sqrt(Math.pow(lt.x - rt.x, 2.0) + Math.pow(lt.y - rt.y, 2.0))) + "px";
                            img.style.height = Math.ceil(Math.sqrt(Math.pow(rt.x - rb.x, 2.0) + Math.pow(rt.y - rb.y, 2.0))) + "px";

                            img.onload = undefined;
                        };

                        this._img.setAttribute("src", this._params.url);
                    } else {
                        img.style.top = Math.floor(lt.y) + "px";
                        img.style.left = Math.floor(lt.x) + "px";

                        img.style.width = Math.ceil(Math.sqrt(Math.pow(lt.x - rt.x, 2.0) + Math.pow(lt.y - rt.y, 2.0))) + "px";
                        img.style.height = Math.ceil(Math.sqrt(Math.pow(rt.x - rb.x, 2.0) + Math.pow(rt.y - rb.y, 2.0))) + "px";
                    }

                    var mapContainer = this.container().parentNode;
                    if (mapContainer) {
                        var e = Xr.Events.create(Xr.Events.LayerUpdateCompleted, { layerName: this.name() });
                        Xr.Events.fire(mapContainer, e);
                    }
                }
            } else { // Need not draw
                if (div.style.display != "none") div.style.display = "none"
            }
        },

        release: function () {
            //.
        },

        /* MBR */ MBR: function () {
            return this._mbr;
        },

        /* boolean */ conneted: function () {
            return this._connected;
        },

        needRendering: function (mapScale) {
            return this.visibility().needRendering(mapScale);
        },

        drawOnCanvas: function (/* canvas DOM */ canvas) {
            //.
        }
    }
});