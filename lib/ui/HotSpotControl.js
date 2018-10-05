Xr.ui = Xr.ui || {};

/**  
 * @classdesc 지도 위에 HotSpot 지점을 표시하기 위한 컨트롤
 * @class
 * @param {String} name - UI 컨트롤에 대한 식별자로써 고유해야 합니다.
 * @param {Xr.Map} map - UI 컨트롤과 상호작용을 하는 지도 객체
 * @param {Xr.PointD} position - 정보 윈도우가 표시될 지도 좌표입니다.
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.ui.HotSpotControl = Xr.Class({
    name: "HotSpotControl",
	extend: Xr.ui.UserControl,
	requires: [Xr.ui.IUserControl, Xr.IMouseInteraction],

    construct: function (/* String */ name, /* Map */ map, /* PointD */ position,
        /* options {color:red, size:200, weight:30 } */ options) {
        Xr.ui.UserControl.call(this, name, map);

        this._position = position;

        options = options ? options : {};

        this._width = options.size ? options.size : 250;
        this._height = options.size ? options.size : 250;
        this._weight = options.weight ? options.weight : 20;
        this._color = options.color ? options.color : "#f1c40f";

        this._skinSvg = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "svg");
        this._skinSvg.style.position = "absolute";
        this._skinSvg.style.top = 0;
        this._skinSvg.style.left = 0;
        this._skinSvg.style.overflow = "visible";
        
        //this._skinSvg.style.setProperty("pointer-events", "none");

        var cont = this.container();

        //cont.style.border = "1px solid red";
        cont.style.width = this._width + "px";
        cont.style.height = this._height + "px";

        cont.appendChild(this._skinSvg);
        //cont.style.visibility = "hidden";
        //cont.style.setProperty("pointer-events", "none");
	},

    methods: {
        addEventListener: function (/* eventName */ eventName, /* function */ callback, /* boolean */ useCapture) {
            this.container().addEventListener(eventName, callback, useCapture === undefined ? false : useCapture);
        },

        _createSkin: function () {
            var w = this._width;
            var h = this._height;
            var color = this._color;
            var lineSize = this._weight;
            var svg = this._skinSvg;
            var shape = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "ellipse");

            var cx = w / 2;
            var cy = h / 2;

            shape.setAttribute("cx", cx);
            shape.setAttribute("cy", cy);
            shape.setAttribute("rx", cx);
            shape.setAttribute("ry", cy);
            shape.setAttribute("stroke", color);
            shape.setAttribute("stroke-width", lineSize);
            shape.setAttribute("fill-opacity", "0");

            svg.appendChild(shape);

            var crossH = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "line");

            crossH.setAttribute("x1", cx - cx*2);
            crossH.setAttribute("x2", cx + cx*2);
            crossH.setAttribute("y1", cy);
            crossH.setAttribute("y2", cy);
            crossH.setAttribute("stroke", color);
            crossH.setAttribute("stroke-width", lineSize);

            svg.appendChild(crossH);

            var crossV= document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "line");

            crossV.setAttribute("x1", cx);
            crossV.setAttribute("x2", cx);
            crossV.setAttribute("y1", cy - cy*2);
            crossV.setAttribute("y2", cy + cy*2);
            crossV.setAttribute("stroke", color);
            crossV.setAttribute("stroke-width", lineSize);

            svg.appendChild(crossV);
            
        },

        update: function () {
            var coordMapper = this.map().coordMapper();
            var vp = coordMapper.W2V(this._position);

            var container = this.container();

            var bSkinReady = this._skinSvg.childNodes.length > 0;
            if (!bSkinReady) {
                this._createSkin();
                container.classList.add("hot-spot-animation");
            }

            container.style.left = (vp.x - this._width/2) + "px";
            container.style.top = (vp.y - this._height/2) + "px";

            container.style.visibility = "visible";
        },

        prepare: function () {
            var that = this;

            that.__onMapScaleChanged = function (e) {
                that.update();
            };

            that.__onMapViewChanged = function (e) {
                that.update();
            },

            this._map.addEventListener(Xr.Events.MapScaleChanged, that.__onMapScaleChanged);
            this._map.addEventListener(Xr.Events.MapViewChanged, that.__onMapViewChanged);
        },

        release: function () {
            if (this.__onMapScaleChanged) {
                this._map.removeEventListener(Xr.Events.MapScaleChanged, this.__onMapScaleChanged);
                delete this.__onMapScaleChanged;
            }

            if (this.__onMapViewChanged) {
                this._map.removeEventListener(Xr.Events.MapViewChanged, this.__onMapViewChanged);
                delete this.__onMapViewChanged;
            }
        },

        mouseDown: function (e) { },

        mouseMove: function (e) {
            var mouseState = this.map().coordMapper().mouseState;

            if (mouseState.bDown) {
                var screenXY = Xr.OperationHelper.screenXY(e);
                var deltaX = screenXY.x - mouseState.downAndMoveScreenPt.x;
                var deltaY = screenXY.y - mouseState.downAndMoveScreenPt.y;
                var container = this.container();

                container.style.left = (Xr.OperationHelper.valueFromPx(container.style.left) + deltaX) + "px";
                container.style.top = (Xr.OperationHelper.valueFromPx(container.style.top) + deltaY) + "px";
            }
        },

        mouseUp: function (e) { },
        click: function (e) { },
        dblClick: function (e) { },

        enableMouse: function (/* bool */ bEnable) { }
	}
});