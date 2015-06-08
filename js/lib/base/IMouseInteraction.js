/**  
 * @classdesc 마우스 이벤트를 처리해야할 클래스가 구현해야할 인터페이스
 * @interface
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license GPL
 */
Xr.IMouseInteraction = Xr.Class({
    name: "IMouseInteraction",
	
    methods: {
        mouseDown: function(e) {},
        mouseMove: function(e) {},
        mouseUp: function(e) {},
        click: function(e) {},
        dblClick: function (e) {}
	}
});