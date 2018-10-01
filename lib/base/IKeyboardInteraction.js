/**  
 * @classdesc 키보드 입력에 대한 이벤트를 처리하고자 하는 클래스가 구현해야할 인터페이스입니다.
 * @interface
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */
Xr.IKeyboardInteraction = Xr.Class({
    name: "IKeyboardInteraction",
	
    methods: {
        keyDown: function (e) { },
        keyPress: function (e) { },
        keyUp: function (e) { }
	}
});