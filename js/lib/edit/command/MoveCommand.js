Xr.edit = Xr.edit || {};

/**  
 * @classdesc 도형 전체를 이동하는 명령을 나타내는 클래스입니다. 
 * @class
 * @param {Xr.layers.GraphicLayer} graphicLayer - 대상이 되는 그래픽 레이어
 * @param {int} id - 대상이 되는 그래픽 Row의 고유 ID
 * @param {int} deltaX - 기존 위치에서 새로운 위치로 이동했을 때에 대한 상대적인 가로 축 거리
 * @param {int} deltaY - 기존 위치에서 새로운 위치로 이동했을 때에 대한 상대적인 세로 축 거리
 * @copyright GEOSERVICE.CO.KR
 * @license GPL
 */
Xr.edit.MoveCommand = Xr.Class({
    name: "MoveCommand",
	extend: Xr.edit.Command,
	requires: [Xr.edit.ICommand],

	construct: function (/* GraphicLayer */ graphicLayer, /* int */ id, /* number */ deltaX, /* number */ deltaY) {
	    Xr.edit.Command.call(this, graphicLayer, id);
	    this._deltaX = deltaX;
	    this._deltaY = deltaY;
	},
 	
	methods: {
	    /* boolean */ run: function () {
	        var row = this.graphicLayer().rowSet().row(this.id());
	        if (!row) return false;
	        row.graphicData().moveByOffset(this._deltaX, this._deltaY);

	        return true;
	    },

	    /* boolean */ undo: function () {
	        var row = this.graphicLayer().rowSet().row(this.id());
	        if (!row) return false;
	        row.graphicData().moveByOffset(-this._deltaX, -this._deltaY);

	        return true;
	    },

	    /* String */ type: function () {
	        return Xr.edit.MoveCommand.TYPE;
	    }
	},

	statics: {
	    TYPE: "MOVE"
	}
});