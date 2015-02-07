/**  
 * @classdesc 마우스 상태 정보를 저장하고 있는 전역 클래스입니다.
 * @class
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */
Xr.UserState = Xr.Class({
    name: "UserState",
    statics: {
        mouseDown: false,

        mouseDownPt: new Xr.PointD(),

        mouseDownMapSnapPt: new Xr.PointD(),

        mouseDownAndMovePt: new Xr.PointD(),

        mouseDownAndMoveMapSnapPt: new Xr.PointD(),

        snapMapPt: new Xr.PointD(),

        bSnapVertex: false,

        bSnapEdge: false
    }
});