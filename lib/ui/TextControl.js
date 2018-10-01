Xr.ui = Xr.ui || {};

/**  
 * @classdesc 텍스트(Text) UI 컨트롤에 대한 클래스입니다.
 * @class
 * @param {String} name - UI 컨트롤에 대한 식별자로써 고유해야 합니다.
 * @param {Xr.Map} map - UI 컨트롤과 상호작용을 하는 지도 객체
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.ui.TextControl = Xr.Class({
    name: "TextControl",
    extend: Xr.ui.UserControl,
    requires: [Xr.ui.IUserControl, Xr.IMouseInteraction],

    construct: function (/* String */ name, /* Map */ map) {
        Xr.ui.UserControl.call(this, name, map);

        var div = document.createElement("div");

        this._div = div;
        div.style.position = "absolute";

        div.style.overflow = "visible";
        div.style.setProperty("pointer-events", "none");

        var container = this.container();

        container.appendChild(div);

        var containerStyle = container.style;
        
        containerStyle.bottom = "45px";
        containerStyle.left = "calc(50% - 100px)";
        div.innerHTML = "Powered by FingerEyes-Xr";

        var style = div.style;

        style.textAlign = "center";
        style.fontSize = "16px";
        style.color = "black";
        style.width = "200px";
        style.padding = "5px 20px 5px 20px";
        style.background = "rgb(214,214,214)";
        style.borderRadius = "20px";
        style.border = "3px solid white";
        style.boxShadow = "inset 2px 2px 4px rgba(0,0,0,0.4)";

        this._onClickCallback = null;
        div.addEventListener("click", this._onClick(this));
    },

    methods: {
        onClick: function (/* function */ callback) {
            if (callback) {
                this._div.style.setProperty("pointer-events", "auto");
                this._div.style.setProperty("cursor", "pointer");
            } else {
                this._div.style.setProperty("pointer-events", "none");
                this._div.style.setProperty("cursor", "auto");
            }

            this._onClickCallback = callback;
        },

        _onClick: function (that) {
            return function () {
                if (that._onClickCallback) {
                    that._onClickCallback(that._map);
                }
            }
        },

        text: function (/* optional string */ v) {
            if (arguments.length == 1) {
                this._div.innerHTML = v;

            } else {
                return this._div.innerHTML;
            }
        },

        update: function () { },

	    prepare: function () { },
	    release: function () { },

        mouseDown: function (e) { },
	    mouseMove: function (e) { },
	    mouseUp: function (e) { },
        click: function (e) {  },
        dblClick: function (e) { },

        enableMouse: function (/* bool */ bEnable) {
            var mode = "none";

            if (bEnable) {
                mode = "auto";
            }

            this._div.style.setProperty("pointer-events", mode);
        }
	}
});