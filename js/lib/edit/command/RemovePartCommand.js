Xr.edit = Xr.edit || {};

/**  
 * @classdesc 도형에 대한 부분(Part)을 제거하는 명령을 나타내는 클래스입니다. 
 * @class
 * @param {Xr.layers.GraphicLayer} graphicLayer - 대상이 되는 그래픽 레이어
 * @param {int} id - 대상이 되는 그래픽 Row의 고유 ID
 * @param {Array} pointList - 도형의 제거된 부분(Part)에 대한 인덱스
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.edit.RemovePartCommand = Xr.Class({
    name: "RemovePartCommand",
	extend: Xr.edit.Command,
	requires: [Xr.edit.ICommand],

	construct: function (/* GraphicLayer */ graphicLayer, /* int */ id, /* int */ idxPartRemoved) {
	    Xr.edit.Command.call(this, graphicLayer, id);
	    this._pointList = undefined;
	    this._idxPartRemoved = idxPartRemoved;
	},
 	
	methods: {
	    /* boolean */ run: function () {
	        var row = this.graphicLayer().rowSet().row(this.id());
	        if (!row) return false;

	        this._pointList = row.graphicData().removePart(this._idxPartRemoved);
	        return true;
	    },

	    /* boolean */ undo: function () {
	        var row = this.graphicLayer().rowSet().row(this.id());
	        if (!row) return false;

	        row.graphicData().insertPart(this._idxPartRemoved, this._pointList);
	        return true;
	    },

	    /* String */ type: function () {
	        return Xr.edit.RemovePartCommand.TYPE;
	    }
	},

	statics: {
	    TYPE: "REMOVE_PART"
	}
});