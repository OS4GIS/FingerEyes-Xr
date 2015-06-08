Xr.data = Xr.data || {};

/**  
 * @classdesc 그래픽 Row에 대한 부모 클래스입니다.
 * @class
 * @param {int} id - 그래픽 Row에 대한 고유 ID
 * @param {Xr.data.IShapeData} graphicData - 그래픽 Row의 실제 구체적인 데이터에 대한 클래스
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license GPL
 */
Xr.data.GraphicRow = Xr.Class({
	name: "GraphicRow",

	construct: function (/* int */ id, /* IShapeData */ graphicData) {
		this._id = id;
		this._graphicData = graphicData;
	},
 	
	methods: {
		id: function() {
			return this._id;
		},
		
	    /* IShapeData */ graphicData: function () {
			return this._graphicData; 
		},

		MBR: function (/* CoordMapper */ coordMapper, /* SVG Element */ container) {
		    return this._graphicData.MBR();
		},

	    /* boolean */ hitTest: function (/* number */ x, /* number */ y, /* CoordMapper */ cm) {
	        return this.graphicData().hitTest(x, y, cm);
	    }
	}
});