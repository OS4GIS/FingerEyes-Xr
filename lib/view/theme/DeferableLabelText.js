Xr.theme = Xr.theme || {};

/**  
 * @classdesc 물리적으로 서로 다른 DBMS 상의 데이터를 기반으로 라벨의 텍스트 내용을 결정하는 클래스가 구현해야 할 추상 클래스입니다.
 * @interface
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.theme.DeferableLabelText = Xr.Class({
    name: "DeferableLabelText",

    construct: function () {
        //.
    },

    methods: {
        /* ShapeMapLayer */ targetLayer: function (/* optioinal ShapeMapLayer */ shapeMapLayer) {
            if (arguments.length == 0) {
                return this._shapeMapLayer;
            } else {
                this._shapeMapLayer = shapeMapLayer;
            }
        },

        // To be implemented method.
        /* abstract */ /* void */ requestLabelText: function(/* int */ fid) { return },

        // Method to be called in requestLabelText.
        /* void */ setText: function (/* int */ fid, /* String */ text) {
            var layerId = this._shapeMapLayer.name();

            var svgContainer = this._svgContainer;
            if (!svgContainer) {
                this._svgContainer = this._shapeMapLayer.labelDrawer().container();
                svgContainer = this._svgContainer;
            }

            var g = svgContainer.getElementById(layerId + fid);

            if (g) {
                var texts = g.getElementsByTagName("text");
                var cntText = texts.length;

                for (var i = 0; i < cntText; i++) {
                    texts[i].textContent = text;
                }   
            }
        }
    }
});