Xr.edit = Xr.edit || {};

/**  
 * @classdesc 편집을 위한 스케치 클래스의 부모 클래스입니다.
 * @class
 * @param {Xr.layers.GraphicLayer} graphicLayer - 대상이 되는 그래픽 레이어
 * @param {int} id - 대상이 되는 그래픽 Row의 고유 ID
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.edit.Sketch = Xr.Class({
    name: "Sketch",

    construct: function (/* EditManager */ editManager, /* IShapeData */ shapeData, /* int */ id, /* boolean */ isNew) {
        if (arguments[0] === __XR_CLASS_LOADING_TIME__) return; // for preventing Error in Xr.Class
        
        this._shapeData = shapeData.clone();
        this._id = id;
        this._editManager = editManager;
        this._completed = false;
        this._isNew = isNew;
        this._bStay = false;
        this._bMeasured = false;
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
	            return this;
	        }
	    },

	    /* boolean */ isMeasured: function () {
	        return this._bMeasured;
	    },

        _drawSnapCursor: function (/* CoordMapper */ coordMapper, /* group SVG Element */ group) {
            var mouseState = coordMapper.mouseState;
            //var cursorPt = coordMapper.W2V(Xr.UserState.snapMapPt);
            var cursorPt = coordMapper.W2V(mouseState.snapMapPt);
            if (!cursorPt || isNaN(cursorPt.x)) return;

            var xmlns = Xr.CommonStrings.SVG_NAMESPACE;

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

	        //if (Xr.UserState.bSnapVertex) {
            if (mouseState.bSnapVertex) {
                cursorHL.setAttribute("stroke", "#ff0000");
                cursorHL.setAttribute("stroke-width", "1");
                cursorVL.setAttribute("stroke", "#ff0000");
                cursorVL.setAttribute("stroke-width", "1");
                //} else if (Xr.UserState.bSnapEdge) {
            } else if (mouseState.bSnapEdge) {
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
	            return this;
	        }
	    },

	    hitTest: function (/* int */ mouseX, /* int */ mouseY, /* CoordMapper */ coordMapper) {
	        return this.shapeData().hitTest(mouseX, mouseY, coordMapper);
	    }

	}
});