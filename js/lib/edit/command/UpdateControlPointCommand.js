Xr.edit = Xr.edit || {};

/** 
 * @classdesc 기존의 컨트롤 포인트(Control Point)의 위치를 변경하는 명령을 나타내는 클래스입니다.
 * @class
 * @param {Xr.layers.GraphicLayer} graphicLayer - 대상이 되는 그래픽 레이어
 * @param {int} id - 대상이 되는 그래픽 Row의 고유 ID
 * @param {int} partIndex - 대상이 되는 정점이 위치하는 도형의 부분(Part)에 대한 인덱스(Index)
 * @param {int} controlPointIndex - 대상이 되는 정점이 위치하는 도형의 부분(Part)을 구성하는 좌표 인덱스(Index)
 * @param {Xr.PointD} newPt - 정점에 새롭게 설정되는 좌표(Vertex)
 * @copyright GEOSERVICE.CO.KR
 * @license GPL
 */
Xr.edit.UpdateControlPointCommand = Xr.Class({
    name: "UpdateControlPointCommand",
	extend: Xr.edit.Command,
	requires: [Xr.edit.ICommand],

	construct: function (/* GraphicLayer */ graphicLayer, /* int */ id,
            /* int */ partIndex, /* int */ controlPointIndex, /* PointD */ newPt) {
	    Xr.edit.Command.call(this, graphicLayer, id);
	    this._partIndex = partIndex;
	    this._controlPointIndex = controlPointIndex;
	    this._newPt = new Xr.PointD(newPt.x, newPt.y);
	    this._oldPt = new Xr.PointD();
	},
 	
	methods: {
	    /* boolean */ run: function () {
	        var row = this.graphicLayer().rowSet().row(this.id());
	        if (!row) return false;
	        var newIdx = row.graphicData().updateControlPoint(this._partIndex, this._controlPointIndex, this._newPt, this._oldPt);
	        if (newIdx != undefined) {
	            this._controlPointIndex = newIdx;
	        }

	        return true;
	    },

	    /* boolean */ undo: function () {
	        var row = this.graphicLayer().rowSet().row(this.id());
	        if (!row) return false;
	        var newIdx = row.graphicData().updateControlPoint(this._partIndex, this._controlPointIndex, this._oldPt);
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