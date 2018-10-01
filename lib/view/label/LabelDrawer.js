Xr.label = Xr.label || {};

/**  
 * @classdesc 라벨을 직접 화면에 그리기 위한 SVG 요소를 생성하는 클래스입니다. 
 * @class
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.label.LabelDrawer = Xr.Class({
    name: "LabelDrawer",

    construct: function () {
        this._svg = document.createElementNS(Xr.CommonStrings.SVG_NAMESPACE, "svg");
        this._svg.style.position = "absolute";
        this._svg.style.top = "0px";
        this._svg.style.left = "0px";
        this._svg.style.width = "100%";
        this._svg.style.height = "100%";
        this._svg.style.overflow = "hidden";
        this._svg.style.setProperty("pointer-events", "none");

        this._mbrList = {};//new Array();
    },

    methods: {
        container: function() {
            return this._svg;
        },

        /* void */ markClean: function (/* string */ layerName) {
            var svg = this._svg;
            var childNodes = svg.childNodes;
            var childNode;
            var id;

            for (var i = childNodes.length - 1; i >= 0; i--) {
                childNode = childNodes[i];
                id = childNode.id;

                if (id.indexOf(layerName) == 0) {
                    childNode._beDeleted = true;
                }
            }
        },

        /* void */ clean: function(/* string */ layerName, /* optional boolean */ bForceAllBeDeleted) {
            var svg = this._svg;
            var childNodes = svg.childNodes;
            var childNode;
            var id;
            var mbrList = this._mbrList;

            for (var i = childNodes.length - 1; i >= 0; i--) {
                childNode = childNodes[i];
                id = childNode.id;

                if (id.indexOf(layerName) == 0) {
                    if (bForceAllBeDeleted || childNode._beDeleted) {
                        svg.removeChild(childNode);
                        delete mbrList[id];
                    }
                }
            }
        },

        /* boolean */ add: function (/* string */ labelId, /* MBR */ thisMBR) {
            var list = this._mbrList;

            for (var id in list) {
                var thatMBR = list[id];

                if (!(thisMBR.minX > thatMBR.maxX || thisMBR.minY > thatMBR.maxY || thisMBR.maxX < thatMBR.minX || thisMBR.maxY < thatMBR.minY)) {
                    return false;
                }
            }

            list[labelId] = thisMBR;

            return true;
        },

        /* void */ reset: function () {
            var svg = this._svg;
            var childNodes = svg.childNodes;

            for (var i = childNodes.length - 1; i >= 0; i--) {
                svg.removeChild(childNodes[i]);
            }

            this._mbrList = {};
        },

        update: function (/* CoordMapper */ coordMapper, /* MouseAction enum */ mouseAction, /* number */ offsetX, /* number */ offsetY) {
            var svg = this._svg;
            var childNodes = svg.childNodes;
            var cntChildNodes = childNodes.length;
            var childNode;

            if (mouseAction === Xr.MouseActionEnum.MOUSE_DOWN) {
                //.
            } else if (mouseAction === Xr.MouseActionEnum.MOUSE_DRAG) {
                /* !!
                for (var i = 0; i < cntChildNodes; i++) {
                    childNode = childNodes[i];
                    childNode.setAttribute("transform", "translate(" + offsetX + "," + offsetY + ")");
                }
                */

                svg.style.top = offsetY + "px"; //!!
                svg.style.left = offsetX + "px"; //!!
            } else {
                // !! ->
                if (mouseAction && mouseAction !== Xr.MouseActionEnum.NO_MOUSE) {
                    svg.style.top = 0;
                    svg.style.left = 0;

                    for (var i = 0; i < cntChildNodes; i++) {
                        childNode = childNodes[i];

                        childNode._offsetX += offsetX;
                        childNode._offsetY += offsetY;

                        childNode.setAttribute("transform",
                            "translate(" + childNode._offsetX + "," + childNode._offsetY + ")");
                    }
                }
                // <- !!
            }
        },

        drawOnCanvas: function (/* canvas DOM */ canvas) {
            var ctx = canvas.getContext("2d");
            var domSvg = this.container();
            var svgString = new XMLSerializer().serializeToString(domSvg);

            var imgLabel = new Image();

            imgLabel.onload = function (imgLabel) {
                return function () {
                    ctx.drawImage(imgLabel, 0, 0);
                };
            }(imgLabel);

            //imgLabel.setAttribute("crossOrigin", "anonymous");
            imgLabel.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString)));
        }
    }
});