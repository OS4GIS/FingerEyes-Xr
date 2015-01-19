Xr.edit = Xr.edit || {};

Xr.edit.Sketch = Xr.Class({
    name: "Sketch",

    construct: function (/* EditManager */ editManager, /* IShapeData */ shapeData, /* int */ id, /* boolean */ isNew) {
        if (arguments.length == 0) return; // for preventing Erorr in Xr.Class
        
        this._shapeData = shapeData.clone();
        this._id = id;
        this._editManager = editManager;
        this._completed = false;
        this._isNew = isNew;
        this._bStay = false;
	},
 	
	methods: {
		shapeData: function() { 
			return this._shapeData; 
		},

		/* int */ id: function() {
		    return parseInt(this._id);
		},

		editManager: function () {
		    return this._editManager;
		},

	    /* boolean */ completed: function () {
	        return this.completed;
	    },

	    /* boolean */ isNew: function (/* boolean */ isNew) {
	        if (arguments.length == 0) {
	            return this._isNew;
	        } else {
	            this._isNew = isNew;
	        }
	    },

	    _drawSnapCursor: function (/* CoordMapper */ coordMapper, /* group SVG Element */ group) {
	        var xmlns = Xr.CommonStrings.SVG_NAMESPACE;
	        var cursorPt = coordMapper.W2V(Xr.UserState.snapMapPt);
	        var cursorHL = document.createElementNS(xmlns, "line");

	        cursorHL.setAttribute("x1", cursorPt.x - 50);
	        cursorHL.setAttribute("y1", cursorPt.y);
	        cursorHL.setAttribute("x2", cursorPt.x + 50);
	        cursorHL.setAttribute("y2", cursorPt.y);

	        var cursorVL = document.createElementNS(xmlns, "line");

	        cursorVL.setAttribute("x1", cursorPt.x);
	        cursorVL.setAttribute("y1", cursorPt.y - 50);
	        cursorVL.setAttribute("x2", cursorPt.x);
	        cursorVL.setAttribute("y2", cursorPt.y + 50);

	        if (Xr.UserState.bSnapVertex) {
	            cursorHL.setAttribute("stroke", "#ff0000");
	            cursorHL.setAttribute("stroke-width", "1");
	            cursorVL.setAttribute("stroke", "#ff0000");
	            cursorVL.setAttribute("stroke-width", "1");
	        } else if (Xr.UserState.bSnapEdge) {
	            cursorHL.setAttribute("stroke", "#ffff00");
	            cursorHL.setAttribute("stroke-width", "1");
	            cursorVL.setAttribute("stroke", "#ffff00");
	            cursorVL.setAttribute("stroke-width", "1");
	        } else {
	            cursorHL.setAttribute("stroke", "#000000");
	            cursorHL.setAttribute("stroke-width", "1");
	            cursorVL.setAttribute("stroke", "#000000");
	            cursorVL.setAttribute("stroke-width", "1");
	        }

	        group.appendChild(cursorHL);
	        group.appendChild(cursorVL);
	    },

	    update: function () {
	        var coordMapper = this._editManager.coordMapper();
	        this.editManager().cleanContainer();
	        var svg = this.createSVG(coordMapper);
	        this.editManager().container().appendChild(svg);
	    },

	    /* bStay */ stay: function (/* optional boolean */ bStay) {
	        if (arguments.length == 0) {
	            return this._bStay;
	        } else {
	            this._bStay = bStay;
	        }
	    },

	    hitTest: function (/* int */ mouseX, /* int */ mouseY, /* CoordMapper */ coordMapper) {
	        return this.shapeData().hitTest(mouseX, mouseY, coordMapper);
	    }

	}
});