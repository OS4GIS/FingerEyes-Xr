/**  
 * @classdesc 마우스 이벤트를 나타내는 열거형 클래스
 * @class
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */
Xr.MouseActionEnum = Xr.Class({
    name: "MouseAcionEnum",
    statics: {
        /**       
         * @desc 마우스 버튼이 눌려진 상태
         * @memberOf Xr.MouseActionEnum 
         * @static
         */
        MOUSE_DOWN: 0,

        /**       
         * @desc 마우스 버튼이 눌려진 상태에서 이동
         * @memberOf Xr.MouseActionEnum 
         * @static
         */
        MOUSE_DRAG: 1,

        /**       
         * @desc 마우스 버튼이 눌려진 상태에서 해제
         * @memberOf Xr.MouseActionEnum 
         * @static
         */
        MOUSE_UP: 2,

        /**       
         * @desc 마우스 상태 없음
         * @memberOf Xr.MouseActionEnum 
         * @static
         */
        NO_MOUSE: -1
    }
});
