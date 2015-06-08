/**  
 * @classdesc 마우스의 클릭을 통해 선택 여부를 판별받기 위한 객체의 클래스가 구현해야 하는 인터페이스입니다.
 * @interface
 * @copyright GEOSERVICE.CO.KR
 * @license GPL
 */
Xr.IHitTest = Xr.Class({
    name: "IHitTest",

    methods: {
        /* boolean */ hitTest: function (/* number */ x, /* number */ y, /* CoordMapper */ cm) { return false; }
    }
});