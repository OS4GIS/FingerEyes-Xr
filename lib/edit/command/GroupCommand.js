/**  
 * @desc edit 네임스페이스입니다. 편집과 관련된 클래스들을 담고 있습니다. 
 * @namespace
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */
Xr.edit = Xr.edit || {};

/**  
 * @classdesc 여러 개의 Command를 처리하는 Command입니다.
 * @class
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.edit.GroupCommand = Xr.Class({
    name: "GroupCommand",
	extend: Xr.edit.Command,
	requires: [Xr.edit.ICommand],

	construct: function () {
	    Xr.edit.Command.call(this, null, -1);

        this._commands = [];
	},

	methods: {
        /* void */ add: function (/* Xr.edit.ICommand */ cmd) {
            this._commands.push(cmd);
        },

        /* boolean */ run: function () {
            var cntCommands = this._commands.length;

            for (var i = 0; i < cntCommands; i++) {
                this._commands[i].run();
            }

	        return true;
	    },

	    /* boolean */ undo: function () {
            var cntCommands = this._commands.length;

            for (var i = 0; i < cntCommands; i++) {
                this._commands[i].undo();
            }

	        return true;
	    },

	    /* String */ type: function () {
            return Xr.edit.GroupCommand.TYPE;
	    }
	},

	statics: {
	    TYPE: "GROUP"
	}
});