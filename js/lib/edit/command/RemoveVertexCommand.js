Xr.edit = Xr.edit || {};

/** 
 * @classdesc 정점을 제거하는 명령을 나타내는 클래스입니다.
 * @class
 * @param {Xr.layers.GraphicLayer} graphicLayer - 대상이 되는 그래픽 레이어
 * @param {int} id - 대상이 되는 그래픽 Row의 고유 ID
 * @param {int} partIndex - 제거된 정점이 위치하는 도형의 부분(Part)에 대한 인덱스(Index)
 * @param {int} controlPointIndex - 제거된 정점이 위치하는 도형의 부분(Part)을 구성하는 좌표 인덱스(Index)
 * @copyright GEOSERVICE.CO.KR
 * @license GPL
 */
Xr.edit.RemoveVertexCommand = Xr.Class({
    name: "RemoveVertexCommand",
	extend: Xr.edit.Command,
	requires: [Xr.edit.ICommand],

	construct: function (/* GraphicLayer */ graphicLayer, /* int */ id, /* int */ partIndex, /* int */ controlPointIndex) {
	    Xr.edit.Command.call(this, graphicLayer, id);
	    this._partIndex = partIndex;
	    this._controlPointIndex = controlPointIndex;
	    this._vertexTobeRemoved = undefined;
	},
 	
	methods: {
	    /* boolean */ run: function () {
	        var row = this.graphicLayer().rowSet().row(this.id());
	        if (!row) return false;

	        this._vertexTobeRemoved = row.graphicData().removeVertex(this._partIndex, this._controlPointIndex);
	        return this._vertexTobeRemoved != undefined;
	    },

	    /* boolean */ undo: function () {
	        var row = this.graphicLayer().rowSet().row(this.id());
	        if (!row) return false;

	        if (!this._vertexTobeRemoved) return false;

	        row.graphicData().insertVertex(this._partIndex, this._controlPointIndex, this._vertexTobeRemoved);
	        return true;
	    },

	    /* String */ type: function () {
	        return Xr.edit.RemoveVertexCommand.TYPE;
	    }
	},

	statics: {
	    TYPE: "REMOVE_VERTEX"
	}
});