Xr.theme = Xr.theme || {};

/**  
 * @classdesc 물리적으로 서로 다른 DBMS 상의 데이터를 기반으로 공간 데이터의 도형을 어떤 심벌(Symbol)로 표현할지를 결정하는 클래스가 구현해야 할 추상 클래스입니다.
 * @interface
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.theme.DeferableShapeDrawTheme = Xr.Class({
    name: "DeferableShapeDrawTheme",

    construct: function () {
        //.
    },

    methods: {
        /* ShapeMapLayer */ targetLayer: function (/* optioinal ShapeMapLayer */ shapeMapLayer) {
            if (arguments.length === 0) {
                return this._shapeMapLayer;
            } else {
                this._shapeMapLayer = shapeMapLayer;
                this._svgContainer = shapeMapLayer.container();
            }
        },

        // To be implemented method.
        /* abstract */ /* void */ requestCondition: function(/* int */ fid) { return },

        // Method to be called in requestCondition.
        /* void */ setSymbol: function (/* int */ fid, /* Xr.symbol.ShapeDrawSymbol */ sds) {
            var svgContainer = this._svgContainer;

            var path = svgContainer.getElementById(fid);
            
            if (path) {
                var shpRow = this._shapeMapLayer.shapeRowSet().rows()[fid];
                if (shpRow) {
                    var shapeType = shpRow.shapeData().type();

                    if (shapeType == Xr.data.ShapeType.POINT) {
                        var newMarkerSVG = sds.markerSymbol().create(shpRow.shapeData().data(), this._shapeMapLayer.coordMapper());

                        svgContainer.removeChild(path);

                        newMarkerSVG.id = path.id;
                        newMarkerSVG.mbr = path.mbr;

                        svgContainer.appendChild(newMarkerSVG);
                    } else if (shapeType == Xr.data.ShapeType.POLYLINE) {
                        sds.penSymbol().attribute(path);
                    } else if (shapeType == Xr.data.ShapeType.POLYGON) {
                        sds.attribute(path);
                    }
                }
            }     
        }
    }
});