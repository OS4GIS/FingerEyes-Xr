Xr.data = Xr.data || {};

/**  
 * @classdesc [GraphicRow]{@link Xr.data.GraphicRow}를 상속받은 구체적인 그래픽 Row 클래스가 구현해야 할 매서드를 정의하고 있는 인터페이스입니다. 
 * @interface
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license GPL
 */
Xr.data.IGraphicRow = Xr.Class({
	name: "IGraphicRow",

	methods: {
	    /* SVG Element */ createSVG: function (/* CoordMapper */ coordMapper) {},
	    /* IShapeData */ graphicData: function () { }
	}
});