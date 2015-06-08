Xr.data = Xr.data || {};

/**  
 * @classdesc 그래픽 Row의 구체적인 데이터 클래스가 구현해야 할 매서드를 정의하고 있는 인터페이스입니다. 
 * @interface
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license GPL
 */
Xr.data.IShapeData = Xr.Class({
    name: "IShapeData",

    methods: {
        /* Point Type: PointD, Polyline or Polygon: PointD Array of Array */ data: function() {},
        /* MBR */ MBR: function () {},
        /* PointD */ representativePoint: function () {},
        /* ShapeData */ clone: function () {},
        /* String */ type: function () { },
        /* boolean */ hitTest: function (/* number */ x, /* number */ y, /* CoordMapper */ cm) {},
        /* ISkecth */ toSketch: function (/* EditManager */ editManager, /* int */ id) { },

        /* string */ toWKT: function (/* boolean */ bMulti) { },
        /* boolean */ fromWKT: function (/* String */ wkt) { },

        /* for Editing -> */
        moveByOffset: function (/* number */ deltaX, /* number */ deltaY) {},
        moveControlPointByOffset: function (/* int */ partIndex, /* int */ controlPointIndex, /* number */ deltaX, /* number */ deltaY) { },
        updateControlPoint: function (/* int */ partIndex, /* int */ controlPointIndex, /* PointD */ newPt, /* ouput PointD */ oldPt) { },
        /* PointD */ removeVertex: function(/* int */ partIndex, /* int */ controlPointIndex) {},
        insertVertex: function (/* int */ partIndex, /* int */ controlPointIndex, /* PointD */ vtx) { },
        insertPart: function (/* int */ partIndex, /* Array of PointD */ pointList) {},
        /* Array of PointD */ removePart: function (/* int */ partIndex) {},
	    /* <- for Editing */
	}
});


