Xr.edit = Xr.edit || {};

/**  
 * @classdesc 스냅 대상이 되는 클래스가 구현해야 하는 인터페이스 
 * @interface
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license GPL
 */
Xr.edit.ISnap = Xr.Class({
    name: "ISnap",

    methods: {
        /* PointD */ vertexSnap: function(/* PointD */ mapPt, /* number */ tol) {},
        /* PointD */ edgeSnap: function (/* PointD */ mapPt, /* number */ tol) {}
    }
});