Xr.edit = Xr.edit || {};

Xr.edit.PointSketch = Xr.Class({
    name: "PointSketch",
	extend: Xr.edit.Sketch,
	requires: [Xr.edit.ISketch, Xr.IMouseInteraction, Xr.IKeyboardInteraction],

	construct: function (/* EditManager */ editManager, /* PointShapeData */ shapeData, /* int */ id, /* boolean */ isNew) {
	    Xr.edit.Sketch.call(this, editManager, shapeData, id, isNew);
	    this._bTouchBody = false;
	},
 	
	methods: {
	    /* SVG Element */ createSVG: function (/* CoordMapper */ coordMapper) {
	        var xmlns = Xr.CommonStrings.SVG_NAMESPACE;
	        var pt = this.shapeData().data();	
	        var vp = coordMapper.W2V(pt);

	        var ptSvg = document.createElementNS(xmlns, "ellipse");
	        ptSvg.setAttribute("cx", vp.x);
	        ptSvg.setAttribute("cy", vp.y);
	        ptSvg.setAttribute("rx", 5);
	        ptSvg.setAttribute("ry", 5);

	        ptSvg.setAttribute("stroke", "#ffffff");
	        ptSvg.setAttribute("stroke-width", "3");
	        ptSvg.setAttribute("stroke-opacity", "1");
	        ptSvg.setAttribute("fill", "#000000");
	        ptSvg.setAttribute("fill-opacity", "1");

	        var group = document.createElementNS(xmlns, "g");
	        group.appendChild(ptSvg);

	        this._drawSnapCursor(coordMapper, group);

	        return group;
	    },

	    mouseDown: function (e) {
	        if (!this.isNew() && !e.ctrlKey) {
	            var offsetXY = Xr.OperationHelper.offsetXY(e);
	            var mouseX = offsetXY.x;
	            var mouseY = offsetXY.y;

	            var coordMapper = this._editManager.coordMapper();
	            var mouseDownMapPt = Xr.UserState.snapMapPt;

	            var wpt = this.shapeData().data();
	            var vpt = coordMapper.W2V(wpt);
	            this._bTouchBody = this.shapeData().hitTest(mouseX, mouseY, coordMapper);

	            return this._bTouchBody; // Sketch를 건드렸는지..
	        } else {
	            return false; // 신규 생성이므로 기존의 Sketch가 없어 기존의 Sketch를 건드리지 않았음을 의미하는 false.
	        }
	    },

	    mouseMove: function (e) {
	        var wpt = this.shapeData().data();
	        var coordMapper = this._editManager.coordMapper();

	        if (this.isNew()) {
	            var pt = Xr.UserState.snapMapPt;

	            wpt.set(pt.x, pt.y);
                this.update();
	        } else {
	            var endPt = Xr.UserState.snapMapPt;
	            var startPt = Xr.UserState.mouseDownAndMoveMapSnapPt;
	            var deltaX = endPt.x - startPt.x;
	            var deltaY = endPt.y - startPt.y;

	            if (this._bTouchBody) {
	                wpt.set(endPt.x, endPt.y);
	                this.update();
	            }
	        }
	    },

	    mouseUp: function (e) {
	        var coordMapper = this._editManager.coordMapper();
	        if (this.isNew()) {
	            var wpt = this.shapeData().data();
	            var pt = Xr.UserState.snapMapPt;

	            wpt.set(pt.x, pt.y);
	            this.update(); 
	        } else if (this._bTouchBody) {
	            var endPt = Xr.UserState.snapMapPt;
	            var startPt = Xr.UserState.mouseDownMapSnapPt;
	            var deltaX = endPt.x - startPt.x;
	            var deltaY = endPt.y - startPt.y;
	            var targetLayer = this.editManager().targetGraphicLayer();
	            var cmd = new Xr.edit.UpdateControlPointCommand(targetLayer, this.id(), 0, 0, endPt); 

	            this._bTouchBody = false;

	            this.editManager().synchronize(cmd);
	        }
	    },

	    click: function (e) {
	        if (this.isNew()) {
	            var targetLayer = this.editManager().targetGraphicLayer();
	            var id = this.id();
	            var graphicRow = new Xr.data.PointGraphicRow(id, this.shapeData());

	            var markerSym = graphicRow.markerSymbol();
	            markerSym.penSymbol().color('#ffff00');
	            markerSym.penSymbol().width(3);
	            markerSym.brushSymbol().color('#cecece');

	            var cmd = new Xr.edit.NewCommand(targetLayer, this.id(), graphicRow);
	            this.editManager().synchronize(cmd);
	        }
	    },

	    dblClick: function (e) {
	        //.  
	    },

	    keyDown: function (e) {
            //.
	    },

	    keyPress: function (e) {
            //.
	    },

	    keyUp: function (e) {
	        if (!this.isNew()) {
	            if (e.keyCode == 46) { // 'DEL' 
	                var editMan = this.editManager();
	                var targetLayer = editMan.targetGraphicLayer();
	                var id = this.id();

	                if (this._bTouchBody) {
	                    var row = targetLayer.rowSet().row(id);
	                    if (row) {
	                        var cmd = new Xr.edit.RemoveCommand(targetLayer, id, row);
	                        editMan.synchronize(cmd);
	                    }
	                }
	            }
	        }
	    },
	}
});