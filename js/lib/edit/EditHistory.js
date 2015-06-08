Xr.edit = Xr.edit || {};

/**  
 * @classdesc 편집 이력을 관리하는 클래스입니다. 이 클래스를 이용하여 Undo, Redo 기능에 대한 API를 호출할 수 있습니다.
 * @class
 * @param {Xr.managers.EditManager} editManager - 편집 관리자 클래스 객체
 * @copyright GEOSERVICE.CO.KR
 * @license GPL
 */
Xr.edit.EditHistory = Xr.Class({
    name: "EditHistory",

	construct: function(/* EditManager */ editManager) {
	    this._commands = new Array();
	    this._index = -1;
	    this._editManager = editManager;
	    this._canUndo = false;
	    this._canRedo = false;
	},
 	
	methods: {
	    undo: function() {
	        if(this._index >= this._commands.length || this._index < 0) return false;

	        var cmd = this._commands[this._index];
	        if (cmd.undo()) {
	            this._editManager.setSketchById(cmd.id());
	            this._editManager.map().update();
	        }

	        this._index--;

	        this._checkState(this._index >= 0, true);

	        return true;
	    },

		redo: function() {
		    if (this._index >= (this._commands.length-1) || this._index < -1) return false;

		    this._index++;

		    var cmd = this._commands[this._index];
		    if (cmd.run()) {
		        this._editManager.setSketchById(cmd.id());
		        this._editManager.map().update();
		    }

		    this._checkState(true, this._index < (this._commands.length - 1));

		    return true;
		},
	
		add: function (/* ICommand */ cmd) {
		    this._commands.splice(this._index + 1, this._commands.length);
		    this._commands.push(cmd);
		    this._index = this._commands.length - 1;

		    this._checkState(true, false);            
		},

		undoable: function() {
		    return this._canUndo;
		},

		redoable: function() {
		    return this._canRedo;
		},

		_checkState: function(/* boolean */ undoable, /* boolean */ redoable) {
		    if (this._canUndo != undoable) {
		        var e = Xr.Events.create(Xr.Events.UndoStateChanged, { disabled: !undoable });
		        Xr.Events.fire(this._editManager.map().container(), e);

		        this._canUndo = undoable;
		    }

		    if (this._canRedo != redoable) {
		        var e = Xr.Events.create(Xr.Events.RedoStateChanged, { disabled: !redoable });
		        
		        Xr.Events.fire(this._editManager.map().container(), e);

		        this._canRedo = redoable;
		    }
		},

		reset: function() {
		    this._commands.length = 0;
		    this._index = 0;

		    this._checkState(false, false);
		}
	}
});