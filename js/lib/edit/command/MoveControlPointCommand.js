Xr.edit = Xr.edit || {};

/**  
 * @classdesc 도형의 제어점(ControlPoint)의 이동 명령을 나타내는 클래스입니다. 
 * @class
 * @param {Xr.layers.GraphicLayer} graphicLayer - 대상이 되는 그래픽 레이어
 * @param {int} id - 대상이 되는 그래픽 Row의 고유 ID
 * @param {int} partIndex - 추가된 정점이 위치하는 도형의 부분(Part)에 대한 인덱스(Index)
 * @param {int} controlPointIndex - 추가된 정점이 위치하는 도형의 부분(Part)을 구성하는 좌표 인덱스(Index)
 * @param {int} deltaX - 기존 위치에서 새로운 위치로 이동했을 때에 대한 상대적인 가로 축 거리
 * @param {int} deltaY - 기존 위치에서 새로운 위치로 이동했을 때에 대한 상대적인 세로 축 거리
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.edit.MoveControlPointCommand = Xr.Class({
    name: "MoveControlPointCommand",
	extend: Xr.edit.Command,
	requires: [Xr.edit.ICommand],

	construct: function (/* GraphicLayer */ graphicLayer, /* int */ id,
            /* int */ partIndex, /* int */ controlPointIndex, /* number */ deltaX, /* number */ deltaY) {
	    Xr.edit.Command.call(this, graphicLayer, id);
	    this._partIndex = partIndex;
	    this._controlPointIndex = controlPointIndex;
	    this._deltaX = deltaX;
	    this._deltaY = deltaY;
	},
 	
	methods: {
	    /* boolean */ run: function () {
	        var row = this.graphicLayer().rowSet().row(this.id());
	        if (!row) return false;
	        var newIdx = row.graphicData().moveControlPointByOffset(this._partIndex, this._controlPointIndex, this._deltaX, this._deltaY);
	        if (newIdx != undefined) {
	            this._controlPointIndex = newIdx;
	        }

	        return true;
	    },

	    /* boolean */ undo: function () {
	        var row = this.graphicLayer().rowSet().row(this.id());
	        if (!row) return false;
	        var newIdx = row.graphicData().moveControlPointByOffset(this._partIndex, this._controlPointIndex, -this._deltaX, -this._deltaY);
	        if (newIdx != undefined) {
	            this._controlPointIndex = newIdx;
	        }

	        return true;
	    },

	    /* String */ type: function () {
	        return Xr.edit.MoveControlPointCommand.TYPE;
	    }
	},

	statics: {
	    TYPE: "MOVE_CONTROL_POINT"
	}
});