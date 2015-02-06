/** 
 * @classdesc 프로젝트에서 공통적으로 사용되는 문자열을 저장하고 있는 정적 클래스입니다. 
 * @class
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */
Xr.CommonStrings = Xr.Class({
    name: "CommonStrings",
    statics: {
        /** 
         * @desc SVG에 대한 네임스페이스 문자열( "http://www.w3.org/2000/svg" )
         * @memberOf Xr.CommonStrings
         * @example 
         * // SVG 네임스페이스 문자열을 이용하여 text 그래픽 요소를 생성
         * var xmlns = Xr.CommonStrings.SVG_NAMESPACE;
         * var text = document.createElementNS(xmlns, "text");
         * @static
         */
        SVG_NAMESPACE: 'http://www.w3.org/2000/svg'
    }
});
