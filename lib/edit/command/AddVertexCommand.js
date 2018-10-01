Xr.edit = Xr.edit || {};

/** 
 * @classdesc 정점을 추가하는 명령을 나타내는 클래스입니다.
 * @class
 * @param {Xr.layers.GraphicLayer} graphicLayer - 대상이 되는 그래픽 레이어
 * @param {int} id - 대상이 되는 그래픽 Row의 고유 ID
 * @param {int} partIndex - 추가된 정점이 위치하는 도형의 부분(Part)에 대한 인덱스(Index)
 * @param {int} controlPointIndex - 추가된 정점이 위치하는 도형의 부분(Part)을 구성하는 좌표 인덱스(Index)
 * @param {Xr.PointD} vtxAdded - 추가된 정점(Vertex)
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.edit.AddVertexCommand = Xr.Class({
    name: "AddVertexCommand",
	extend: Xr.edit.Command,
	requires: [Xr.edit.ICommand],

	construct: function (/* GraphicLayer */ graphicLayer, /* int */ id, /* int */ partIndex, /* int */ controlPointIndex, /* PointD */ vtxAdded) {
	    Xr.edit.Command.call(this, graphicLayer, id);
	    this._partIndex = partIndex;
	    this._controlPointIndex = controlPointIndex;
	    this._vetexAdded = vtxAdded;
	},
 	
	methods: {
	    /* boolean */ run: function () {
	        var row = this.graphicLayer().rowSet().row(this.id());
	        if (!row) return false;

	        row.graphicData().insertVertex(this._partIndex, this._controlPointIndex, this._vetexAdded);
	        return true;
	    },

	    /* boolean */ undo: function () {
	        var row = this.graphicLayer().rowSet().row(this.id());
	        if (!row) return false;

	        row.graphicData().removeVertex(this._partIndex, this._controlPointIndex);
	        return true;
	    },

	    /* String */ type: function () {
	        return Xr.edit.AddVertexCommand.TYPE;
	    }
	},

	statics: {
	    TYPE: "ADD_VERTEX"
	}
});