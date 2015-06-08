/**  
 * @desc edit 네임스페이스입니다. 편집과 관련된 클래스들을 담고 있습니다. 
 * @namespace
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license GPL
 */
Xr.edit = Xr.edit || {};

/**  
 * @classdesc 도형에 대한 부분(Part)을 추가하는 명령을 나타내는 클래스입니다. 
 * @class
 * @param {Xr.layers.GraphicLayer} graphicLayer - 대상이 되는 그래픽 레이어
 * @param {int} id - 대상이 되는 그래픽 Row의 고유 ID
 * @param {Array} pointList - 도형의 추가한 부분(Part)을 구성하는 좌표에 대한 배열로써 좌표에 대한 타입은 [Xr.PointD]{@link Xr.PointD}입니다. 
 * @copyright GEOSERVICE.CO.KR
 * @license GPL
 */
Xr.edit.AddPartCommand = Xr.Class({
    name: "AddPartCommand",
	extend: Xr.edit.Command,
	requires: [Xr.edit.ICommand],

	construct: function (/* GraphicLayer */ graphicLayer, /* int */ id, /* Array of PointD */ pointList) {
	    Xr.edit.Command.call(this, graphicLayer, id);
	    this._pointList = Xr.OperationHelper.copyArrayOfPointD(pointList);
	},
 	
	methods: {
	    /* boolean */ run: function () {
	        var row = this.graphicLayer().rowSet().row(this.id());
	        if (!row) return false;

	        row.graphicData().insertPart(-1, this._pointList);
	        return true;
	    },

	    /* boolean */ undo: function () {
	        var row = this.graphicLayer().rowSet().row(this.id());
	        if (!row) return false;

	        row.graphicData().removePart(-1);
	        return true;
	    },

	    /* String */ type: function () {
	        return Xr.edit.AddPartCommand.TYPE;
	    }
	},

	statics: {
	    TYPE: "ADD_PART"
	}
});