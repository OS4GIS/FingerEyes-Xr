Xr.edit = Xr.edit || {};

Xr.edit.EllipseSketch = Xr.Class({
    name: "EllipseSketch",
    extend: Xr.edit.Sketch,
    requires: [Xr.edit.ISketch, Xr.IMouseInteraction, Xr.IKeyboardInteraction],

    construct: function (/* EditManager */ editManager, /* RectangleShapeData */ shapeData, /* int */ id, /* boolean */ isNew) {
        Xr.edit.Sketch.call(this, editManager, shapeData, id, isNew);
        this._bTouchBody = false;
        this._idxTouchControl = -1;
    },
 	
    methods: {
        /* SVG Element */ _createControlPointSVG: function (/* number */ vx, /* number */ vy) {
            var xmlns = Xr.CommonStrings.SVG_NAMESPACE;
            var svg = document.createElementNS(xmlns, "ellipse");

            svg.setAttribute("cx", vx);
            svg.setAttribute("cy", vy);
            svg.setAttribute("rx", 5);
            svg.setAttribute("ry", 5);

            svg.setAttribute("stroke", "#ffffff");
            svg.setAttribute("stroke-width", "3");
            svg.setAttribute("stroke-opacity", "1");
            svg.setAttribute("fill", "#000000");
            svg.setAttribute("fill-opacity", "1");

            return svg;
        },

	    /* SVG Element */ createSVG: function (/* CoordMapper */ coordMapper) {
	        var xmlns = Xr.CommonStrings.SVG_NAMESPACE;
	        var data = this.shapeData().data();

	        var minX = data.cx - data.rx;
	        var minY = data.cy - data.ry;
	        var maxX = data.cx + data.rx;
	        var maxY = data.cy + data.ry;

	        var temp;
	        if (minX > maxX) {
	            temp = minX;
	            minX = maxX;
	            maxX = temp;
	        }

	        if (minY > maxY) {
	            temp = minY;
	            minY = maxY;
	            maxY = temp;
	        }

	        var lt = coordMapper.W2V(new Xr.PointD(minX, maxY));
	        var rb = coordMapper.W2V(new Xr.PointD(maxX, minY));

	        var rectSvg;

	        var vp = coordMapper.W2V(new Xr.PointD(data.cx, data.cy));
	        var vrx = coordMapper.viewLength(data.rx);
	        var vry = coordMapper.viewLength(data.ry);

	        ellipSvg = document.createElementNS(xmlns, "ellipse");
	        ellipSvg.setAttribute("cx", vp.x);
	        ellipSvg.setAttribute("cy", vp.y);
	        ellipSvg.setAttribute("rx", vrx);
	        ellipSvg.setAttribute("ry", vry);

	        ellipSvg.setAttribute("stroke", "#00ffff");
	        ellipSvg.setAttribute("stroke-width", "3");
	        ellipSvg.setAttribute("stroke-opacity", "0.5");
	        ellipSvg.setAttribute("fill", "#00ffff");
	        ellipSvg.setAttribute("stroke-linecap", "butt");
	        ellipSvg.setAttribute("fill-opacity", "0.5");
	        
	        var rectSvg = document.createElementNS(xmlns, "rect");

	        rectSvg.setAttribute("x", lt.x);
	        rectSvg.setAttribute("y", lt.y);
	        rectSvg.setAttribute("width", rb.x - lt.x);
	        rectSvg.setAttribute("height", rb.y - lt.y);

	        rectSvg.setAttribute("stroke", "#00ffff");
	        rectSvg.setAttribute("stroke-width", "3");
	        rectSvg.setAttribute("stroke-opacity", "0.5");
	        rectSvg.setAttribute("fill", "none");
	        rectSvg.setAttribute("stroke-linecap", "butt");

	        var group = document.createElementNS(xmlns, "g");
	        group.appendChild(ellipSvg);
	        group.appendChild(rectSvg);

	        if (!this.isNew()) {
	            var vp = undefined;

	            group.appendChild(this._createControlPointSVG(lt.x, lt.y));
	            group.appendChild(this._createControlPointSVG((lt.x + rb.x) / 2, lt.y));
	            group.appendChild(this._createControlPointSVG(rb.x, lt.y));
	            group.appendChild(this._createControlPointSVG(rb.x, (lt.y + rb.y) / 2));
	            group.appendChild(this._createControlPointSVG(rb.x, rb.y));
	            group.appendChild(this._createControlPointSVG((lt.x + rb.x) / 2, rb.y));
	            group.appendChild(this._createControlPointSVG(lt.x, rb.y));
	            group.appendChild(this._createControlPointSVG(lt.x, (lt.y + rb.y) / 2));
	        }

	        this._drawSnapCursor(coordMapper, group);

	        return group;
	    },

	    mouseDown: function (e) {
	        var offsetXY = Xr.OperationHelper.offsetXY(e);
	        var mouseX = offsetXY.x;
	        var mouseY = offsetXY.y;
	        var coordMapper = this._editManager.coordMapper();
	        var data = this.shapeData().data();

	        if (this.isNew()) {
	            var mouseDownMapPt = Xr.UserState.snapMapPt;

	            data.cx = mouseDownMapPt.x;
	            data.cy = mouseDownMapPt.y;

	            console.log("ellipse mouseDown");

	            return false; // 신규 생성이므로 기존의 Sketch가 없어 기존의 Sketch를 건드리지 않았음을 의미하는 false.
	        } else {
	            console.log("ellipse mouseDown, not new");

	            var minX = data.cx - data.rx;
	            var minY = data.cy - data.ry;
	            var maxX = data.cx + data.rx;
	            var maxY = data.cy + data.ry;
	            var lt = coordMapper.W2V(new Xr.PointD(minX, maxY));
	            var rb = coordMapper.W2V(new Xr.PointD(maxX, minY));
	            var mouseDownPt = new Xr.PointD(mouseX, mouseY);

	            this._bTouchBody = false;
	            this._idxTouchControl = -1;
	            
	            if(Xr.GeometryHelper.pointIn(lt.x, lt.y, 7, mouseDownPt)) this._idxTouchControl = 0;
	            else if(Xr.GeometryHelper.pointIn((lt.x + rb.x) / 2, lt.y, 7, mouseDownPt)) this._idxTouchControl = 1;
	            else if (Xr.GeometryHelper.pointIn(rb.x, lt.y, 7, mouseDownPt)) this._idxTouchControl = 2;
	            else if (Xr.GeometryHelper.pointIn(rb.x, (lt.y + rb.y) / 2, 7, mouseDownPt)) this._idxTouchControl = 3;
	            else if (Xr.GeometryHelper.pointIn(rb.x, rb.y, 7, mouseDownPt)) this._idxTouchControl = 4;
	            else if (Xr.GeometryHelper.pointIn((lt.x + rb.x) / 2, rb.y, 7, mouseDownPt)) this._idxTouchControl = 5;
	            else if (Xr.GeometryHelper.pointIn(lt.x, rb.y, 7, mouseDownPt)) this._idxTouchControl = 6;
	            else if (Xr.GeometryHelper.pointIn(lt.x, (lt.y + rb.y) / 2, 7, mouseDownPt)) this._idxTouchControl = 7;
	            else this._bTouchBody = this.shapeData().hitTest(mouseX, mouseY, coordMapper);

	            return this._bTouchBody || this._idxTouchControl != -1; // Sketch를 건드렸는지..
	        }
	    },

	    mouseMove: function (e) {
	        var data = this.shapeData().data();
	        var coordMapper = this._editManager.coordMapper();
	        
	        if (this.isNew()) {
	            if (Xr.UserState.mouseDown) {
	                var moveMapPt = Xr.UserState.snapMapPt;
	                data.rx = Math.abs(data.cx - moveMapPt.x);
	                data.ry = Math.abs(data.cy - moveMapPt.y);

	                console.log("ellipse mouseMove");
	            }


	            this.update();
	        } else {
	            var endPt = Xr.UserState.snapMapPt;
	            var startPt = Xr.UserState.mouseDownAndMoveMapSnapPt;
	            var deltaX = endPt.x - startPt.x;
	            var deltaY = endPt.y - startPt.y;

	            if (this._bTouchBody) {	                
	                data.cx += deltaX;
	                data.cy += deltaY;
	                this.update();
	            } else if (this._idxTouchControl != -1) {
	                var newRx = Math.abs(data.cx - endPt.x);
	                var newRy = Math.abs(data.cy - endPt.y);
	                if (this._idxTouchControl == 0) {
	                    data.rx = newRx;
	                    data.ry = newRy;
	                } else if (this._idxTouchControl == 1) {
	                    data.ry = newRy;
	                } else if (this._idxTouchControl == 2) {
	                    data.rx = newRx;
	                    data.ry = newRy;
	                } else if (this._idxTouchControl == 3) {
	                    data.rx = newRx;
	                } else if (this._idxTouchControl == 4) {
	                    data.rx = newRx;
	                    data.ry = newRy;
	                } else if (this._idxTouchControl == 5) {
	                    data.ry = newRy;
	                } else if (this._idxTouchControl == 6) {
	                    data.rx = newRx;
	                    data.ry = newRy;
	                } else if (this._idxTouchControl == 7) {
	                    data.rx = newRx;
	                }

	                this.update();
	            }
	        }
	    },

	    mouseUp: function (e) {
	        var coordMapper = this._editManager.coordMapper();
	        var endPt = Xr.UserState.snapMapPt;
	        var startPt = Xr.UserState.mouseDownMapSnapPt;
	        var deltaX = endPt.x - startPt.x;
	        var deltaY = endPt.y - startPt.y;
	        var targetLayer = this.editManager().targetGraphicLayer();
	        var data = this.shapeData().data();

	        if (this.isNew()) {
	            var targetLayer = this.editManager().targetGraphicLayer();
	            var id = this.id();
	            var graphicRow = new Xr.data.EllipseGraphicRow(id, this.shapeData());

	            graphicRow.penSymbol().color('#383838');
	            graphicRow.penSymbol().width(3);
	            graphicRow.brushSymbol().color('#cecece');

	            var cmd = new Xr.edit.NewCommand(targetLayer, this.id(), graphicRow);

	            console.log("ellipse mouseUp");

	            this.editManager().synchronize(cmd);
	        } else if (this._idxTouchControl != -1) {
	            var newSizePt = new Xr.PointD(Math.abs(data.cx - endPt.x), Math.abs(data.cy - endPt.y));
	            var cmd = new Xr.edit.UpdateControlPointCommand(targetLayer, this.id(), 0, this._idxTouchControl, newSizePt);

	            this._idxTouchControl = -1;
	            this.editManager().synchronize(cmd);
	        } else if (this._bTouchBody) {
	            var cmd = new Xr.edit.MoveCommand(targetLayer, this.id(), deltaX, deltaY);

	            this._bTouchBody = false;
	            this.editManager().synchronize(cmd);
	        }
	    },

	    click: function (e) {
	        //.
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