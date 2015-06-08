Xr.label = Xr.label || {};

/**  
 * @classdesc 라벨을 직접 화면에 그리기 위한 SVG 요소를 생성하는 클래스입니다. 
 * @class
 * @copyright GEOSERVICE.CO.KR
 * @license GPL
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

        this._mbrList = new Array();
    },

    methods: {
        container: function() {
            return this._svg;
        },

        /* void */ clean: function(/* string */ layerName) {
            var svg = this._svg;
            var childNodes = svg.childNodes;
            var cntChildNodes = childNodes.length;
            var childNode;

            for (var i = cntChildNodes-1; i >= 0; i--) {
                childNode = childNodes[i];
                var id = childNode.id;
                if(id.indexOf(layerName) == 0) {
                    svg.removeChild(childNode);
                }
            }
        },

        reset: function () {
            this._mbrList = [];
        },

        /* boolean */ add: function (/* MBR */ thisMBR) {
            var list = this._mbrList;
            var count = list.length;
            for (var i = 0; i < count; i++) {
                var thatMBR = list[i];

                if (!(thisMBR.minX > thatMBR.maxX || thisMBR.minY > thatMBR.maxY || thisMBR.maxX < thatMBR.minX || thisMBR.maxY < thatMBR.minY)) {
                    return false;
                }
            }

            list.push(thisMBR);

            return true;
        },

        update: function (/* CoordMapper */ coordMapper, /* MouseAction enum */ mouseAction, /* number */ offsetX, /* number */ offsetY) {
            var svg = this._svg;
            var childNodes = svg.childNodes;
            var cntChildNodes = childNodes.length;
            var childNode;

            if (mouseAction == Xr.MouseActionEnum.MOUSE_DOWN) {
                //.
            } else if (mouseAction == Xr.MouseActionEnum.MOUSE_DRAG) {
                for (var i = 0; i < cntChildNodes; i++) {
                    childNode = childNodes[i];
                    childNode.setAttribute("transform", "translate(" + offsetX + "," + offsetY + ")");
                }
            } else {
               this.reset();
            }
        }
    }
});