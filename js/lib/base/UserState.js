/**  
 * @classdesc 마우스 상태 정보를 저장하고 있는 전역 클래스입니다.
 * @class
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */
Xr.UserState = Xr.Class({
    name: "UserState",
    statics: {
        /**       
         * @desc 현재 시점에서 사용자가 마우스 버튼을 누르고 있다면 true 값이 저장됩니다.
         * @memberOf Xr.UserState 
         * @static
         * @readonly
         * @type {boolean}
         */
        mouseDown: false,

        /**       
         * @desc 사용자가 마우스 버튼을 눌렀을 때 누른 위치에 대한 좌표로써 화면 좌표계입니다.
         * @memberOf Xr.UserState 
         * @static
         * @readonly
         * @type {Xr.PointD}
         */
        mouseDownPt: new Xr.PointD(),

        /**       
         * @desc 사용자가 마우스 버튼을 눌렀을 때 누른 위치 좌표로서 스냅핑 기능으로 보정된 좌표이며 지도 좌표계입니다.
         * @memberOf Xr.UserState 
         * @static
         * @readonly
         * @type {Xr.PointD}
         */
        mouseDownMapSnapPt: new Xr.PointD(),

        /**       
         * @desc 사용자가 마우스 버튼을 누른 상태에서 이동하고 하고 있을 때의 위치 좌표로써 화면 좌표계입니다.
         * @memberOf Xr.UserState 
         * @static
         * @readonly
         * @type {Xr.PointD}
         */
        mouseDownAndMovePt: new Xr.PointD(),

        /**       
         * @desc 사용자가 마우스 버튼을 누른 상태에서 이동하고 하고 있을 때의 위치 좌표로서 스냅핑 기능으로 보정된 좌표이며 지도 좌표계입니다.
         * @memberOf Xr.UserState 
         * @static
         * @readonly
         * @type {Xr.PointD}
         */
        mouseDownAndMoveMapSnapPt: new Xr.PointD(),

        /**       
         * @desc 현재 마우스 위치에 대한 스냅핑 기능으로 보정된 좌표이며 지도 좌표계입니다.
         * @memberOf Xr.UserState 
         * @static
         * @readonly
         * @type {Xr.PointD}
         */
        snapMapPt: new Xr.PointD(),

        /**       
         * @desc 스냅핑 기능 중 정점(Vertex)에 대한 기능의 작동 여부
         * @memberOf Xr.UserState 
         * @static
         * @readonly
         * @type {boolean}
         */
        bSnapVertex: false,

        /**       
         * @desc 스냅핑 기능 중 선분(Segment)또는 모서리(Edge)에 대한 기능의 작동 여부
         * @memberOf Xr.UserState 
         * @static
         * @readonly
         * @type {boolean}
         */
        bSnapEdge: false
    }
});