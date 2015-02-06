Xr.edit = Xr.edit || {};

/**  
 * @classdesc 신규 도형을 추가했을 때의 명령을 나타내는 클래스입니다. 
 * @class
 * @param {Xr.layers.GraphicLayer} graphicLayer - 대상이 되는 그래픽 레이어
 * @param {int} id - 대상이 되는 그래픽 Row의 고유 ID
 * @param {Xr.data.IGraphicRow} graphicRow - 새롭게 추가된 그래픽 Row에 대한 클래스 객체
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.edit.NewCommand = Xr.Class({
    name: "NewCommand",
	extend: Xr.edit.Command,
	requires: [Xr.edit.ICommand],

	construct: function (/* GraphicLayer */ graphicLayer, /* int */ id, /* IGraphicRow */ graphicRow) {
	    Xr.edit.Command.call(this, graphicLayer, id);
	    this._graphicRow = graphicRow;
	},

	methods: {
	    /* boolean */ run: function () {
	        return this.graphicLayer().rowSet().add(this._graphicRow);
	    },

	    /* boolean */ undo: function () {
	        var id = this.id();
	        return this.graphicLayer().rowSet().remove(id);
	    },

	    /* String */ type: function () {
	        return Xr.edit.NewCommand.TYPE;
	    }
	},

	statics: {
	    TYPE: "NEW"
	}
});