/**  
 * @classdesc 현재 지도 조작에 대한 상태를 나타내는 열거형 클래스입니다.
 * @class
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */
Xr.UserModeEnum = Xr.Class({
    name: "UserModeEnum",
    statics: {
        /**       
         * @desc 지도 이동/확대/축소/회전 모드
         * @memberOf Xr.UserModeEnum
         * @static
         */
        VIEW: 0,

        /**       
         * @desc 편집 모드
         * @memberOf Xr.UserModeEnum
         * @static
         */
        EDIT: 1,
    }
});