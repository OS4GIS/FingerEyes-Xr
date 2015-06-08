Xr.edit = Xr.edit || {};

/**  
 * @classdesc 기존 도형을 삭제했을 때의 명령을 나타내는 클래스입니다. 
 * @class
 * @param {Xr.layers.GraphicLayer} graphicLayer - 대상이 되는 그래픽 레이어
 * @param {int} id - 대상이 되는 그래픽 Row의 고유 ID
 * @param {Xr.data.IGraphicRow} graphicRow - 제거된 그래픽 Row에 대한 클래스 객체
 * @copyright GEOSERVICE.CO.KR
 * @license GPL
 */
Xr.edit.RemoveCommand = Xr.Class({
    name: "RemoveCommand",
	extend: Xr.edit.Command,
	requires: [Xr.edit.ICommand],

	construct: function (/* GraphicLayer */ graphicLayer, /* int */ id, /* IGraphicRow */ graphicRow) {
	    Xr.edit.Command.call(this, graphicLayer, id);
	    this._graphicRow = graphicRow;
	},
 	
	methods: {
	    /* boolean */ run: function () {
	        var id = this.id();
	        var rowSet = this.graphicLayer().rowSet();
	        if (rowSet.row(id)) {
	            rowSet.remove(id);
	            return true;
	        } else {
	            return false;
	        }
	    },

	    /* boolean */ undo: function () {
	        return this.graphicLayer().rowSet().add(this._graphicRow);
	    },

	    /* String */ type: function () {
	        return Xr.edit.RemoveCommand.TYPE;
	    }
	},

	statics: {
	    TYPE: "REMOVE"
	}
});