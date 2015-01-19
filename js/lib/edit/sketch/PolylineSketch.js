Xr.edit = Xr.edit || {};

Xr.edit.PolylineSketch = Xr.Class({
    name: "PolylineSketch",
	extend: Xr.edit.Sketch,
	requires: [Xr.edit.ISketch, Xr.IMouseInteraction, Xr.IKeyboardInteraction],

	construct: function (/* EditManager */ editManager, /* PolylineShapeData */ shapeData, /* int */ id, /* boolean */ isNew) {
	    Xr.edit.Sketch.call(this, editManager, shapeData, id, isNew);
	    this._bTouchBody = false;
	    this._idxTouchPart = -1;
	    this._idxTouchVtx = -1;
	},
 	
	methods: {
	    /* SVG Element */ createSVG: function (/* CoordMapper */ coordMapper) {
	        var xmlns = Xr.CommonStrings.SVG_NAMESPACE;
	        var polylines = this.shapeData().data();	
	        var ringCount = polylines.length;
			
	        var d = "";

	        for (var iRing = 0; iRing < ringCount; ++iRing) {
	            var polyline = polylines[iRing];
	            var vertexCount = polyline.length;
	            for(var iVtx=0; iVtx<vertexCount; ++iVtx) {
	                var wp = polyline[iVtx];	
	                var vp = coordMapper.W2V(wp);

	                if(iVtx == 0) {
	                    d += " M " + (vp.x) + " " + (vp.y);
	                } else {
	                    d += " L " + (vp.x) + " " + (vp.y);
	                }
	            }
	        }

	        var pathSVG = document.createElementNS(xmlns, "path");
	        pathSVG.setAttribute("d", d);
	        pathSVG.setAttribute("fill", "none");
	        pathSVG.setAttribute("stroke", "#00ffff");
	        pathSVG.setAttribute("stroke-width", "3");
	        pathSVG.setAttribute("stroke-opacity", "0.5");
	        pathSVG.setAttribute("stroke-linecap", "butt");
	        
	        var group = document.createElementNS(xmlns, "g");
	        group.appendChild(pathSVG);

	        if (!this.isNew()) {
	            for (var iRing = 0; iRing < ringCount; ++iRing) {
	                var polyline = polylines[iRing];
	                var vertexCount = polyline.length;
	                for (var iVtx = 0; iVtx < vertexCount; ++iVtx) {
	                    var wp = polyline[iVtx];
	                    var vp = coordMapper.W2V(wp);
	                    var svg = document.createElementNS(xmlns, "ellipse");

	                    svg.setAttribute("cx", vp.x);
	                    svg.setAttribute("cy", vp.y);
	                    svg.setAttribute("rx", 5);
	                    svg.setAttribute("ry", 5);

	                    svg.setAttribute("stroke", "#ffffff");
	                    svg.setAttribute("stroke-width", "3");
	                    svg.setAttribute("stroke-opacity", "1");
	                    svg.setAttribute("fill", "#000000");
	                    svg.setAttribute("fill-opacity", "1");

	                    group.appendChild(svg);
	                }
	            }
	        }

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

	            var polylines = this.shapeData().data();
	            var cntPolyline = polylines.length;

	            this._bTouchBody = false;
	            this._idxTouchPart = -1;
	            this._idxTouchVtx = -1;

	            for (var iPart = 0; iPart < cntPolyline; iPart++) {
	                var polyline = polylines[iPart];
	                var cntPts = polyline.length;
	                for (var i = 0; i < cntPts; i++) {
	                    var pt = coordMapper.W2V(polyline[i]);
	                    if (Xr.GeometryHelper.pointIn(mouseX, mouseY, 7, pt)) {
	                        this._idxTouchPart = iPart;
	                        this._idxTouchVtx = i;
	                        break;
	                    }
	                }
	            }

	            if (this._idxTouchPart == -1 && this._idxTouchVtx == -1) {
	                this._bTouchBody = this.shapeData().hitTest(mouseX, mouseY, coordMapper);
	            }

	            return this._bTouchBody || this._idxTouchVtx != -1; // Sketch를 건드렸는지..
	        } else {
	            return false; // 신규 생성이므로 기존의 Sketch가 없어 기존의 Sketch를 건드리지 않았음을 의미하는 false.
	        }
	    },

	    mouseMove: function (e) {
	        var polylines = this.shapeData().data();
	        var polyline = polylines[polylines.length - 1];
	        var cntPts = polyline.length;
	        var coordMapper = this._editManager.coordMapper();

	        if (this.isNew()) {
	            if (cntPts > 0) {
	                var pt = Xr.UserState.snapMapPt;

	                if (cntPts > 1) {
	                    polyline.pop();
	                }

	                polyline.push(pt);
	            }

	            this.update();
	        } else {
	            var endPt = Xr.UserState.snapMapPt;
	            var startPt = Xr.UserState.mouseDownAndMoveMapSnapPt;
	            var deltaX = endPt.x - startPt.x;
	            var deltaY = endPt.y - startPt.y;

	            if (this._bTouchBody) {	                
	                var cntPolylines = polylines.length;
	                for (var iPart = 0; iPart < cntPolylines; iPart++) {
	                    polyline = polylines[iPart];
	                    var cntVtx = polyline.length;
	                    for (var iVtx = 0; iVtx < cntVtx; iVtx++) {
	                        polyline[iVtx].add(deltaX, deltaY);
	                    }
	                }

	                this.update();
	            } else if(this._idxTouchPart != -1 && this._idxTouchVtx != -1) {
	                polyline = polylines[this._idxTouchPart];
	                var pt = polyline[this._idxTouchVtx];
	                pt.set(endPt.x, endPt.y);

	                this.update();
	            }
	        }
	    },

	    mouseUp: function (e) {
	        var polylines = this.shapeData().data();
	        var coordMapper = this._editManager.coordMapper();
	        var endPt = Xr.UserState.snapMapPt;
	        var pt = Xr.UserState.snapMapPt;
	        var startPt = Xr.UserState.mouseDownMapSnapPt;
	        var deltaX = endPt.x - startPt.x;
	        var deltaY = endPt.y - startPt.y;
	        var targetLayer = this.editManager().targetGraphicLayer();

	        if (this.isNew()) {
	            var polyline = polylines[polylines.length - 1];
	            var coordMapper = this._editManager.coordMapper();
	            
	            polyline.push(pt);
	            this.update(); 
	        } else if (this._idxTouchPart != -1 && this._idxTouchVtx != -1) {
	            var cmd = new Xr.edit.UpdateControlPointCommand(targetLayer, this.id(), this._idxTouchPart, this._idxTouchVtx, endPt);

	            this._idxTouchPart = -1;
	            this._idxTouchVtx = -1;

	            this.editManager().synchronize(cmd);
	        } else if (e.ctrlKey) {
	            var tol = coordMapper.snappingTolerance();
	            var cntPolylines = polylines.length;
	            var idxInserted = -1;
	            var intPt = undefined;

	            for (var iPart = 0; iPart < cntPolylines; iPart++) {
	                polyline = polylines[iPart];
	                var cntVtx = polyline.length - 1;
	                for (var iVtx = 0; iVtx < cntVtx; iVtx++) {
	                    var p1 = polyline[iVtx];
	                    var p2 = polyline[iVtx + 1];
	                    var intPt = Xr.GeometryHelper.intersectPointFromLine(p1, p2, pt, tol);
	                    if (intPt) {
	                        idxInserted = iVtx + 1;
	                        break;
	                    }
	                }

	                if (intPt) {
	                    var cmd = new Xr.edit.AddVertexCommand(targetLayer, this.id(), iPart, idxInserted, intPt);
	                    this.editManager().synchronize(cmd);
	                    return;
	                }
	            }

	            if (!intPt) {
	                polylines.push([pt]);
	                this.isNew(true);
	                return;
	            }
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
	        if (this.isNew()) {
	            var polylines = this.shapeData().data();
	            var polyline = polylines[polylines.length - 1];
	            if (polyline.length >= (2 + 2)) { // 2 are dummy vertices.
	                polyline.pop();
	                polyline.pop();

	                var targetLayer = this.editManager().targetGraphicLayer();
	                var id = this.id();

	                if (polylines.length == 1) { // Add New Row
	                    var graphicRow = new Xr.data.PolylineGraphicRow(id, this.shapeData());

	                    graphicRow.penSymbol().color('#fefe22');
	                    graphicRow.penSymbol().width(3);

	                    var cmd = new Xr.edit.NewCommand(targetLayer, this.id(), graphicRow);
	                    this.editManager().synchronize(cmd);
	                } else { // Add New Part
	                    var cmd = new Xr.edit.AddPartCommand(targetLayer, this.id(), polyline);
	                    this.editManager().synchronize(cmd);
	                }
	            } else {
	                this.editManager().synchronize(undefined);
	            }
	        }
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
	                var targetLayer = this.editManager().targetGraphicLayer();
	                var id = this.id();

	                if (this._bTouchBody) {
	                    var row = targetLayer.rowSet().row(id);
	                    if (row) {
	                        var cmd = new Xr.edit.RemoveCommand(targetLayer, id, row);
	                        this.editManager().synchronize(cmd);
	                    }
	                } else if (this._idxTouchPart != -1 && this._idxTouchVtx != -1) {
	                    var polylines = this.shapeData().data();
	                    var polyline = polylines[this._idxTouchPart];

	                    if (polyline.length > 2) {
	                        var cmd = new Xr.edit.RemoveVertexCommand(targetLayer, id, this._idxTouchPart, this._idxTouchVtx);

	                        this._idxTouchPart = -1;
	                        this._idxTouchVtx = -1;

	                        this.editManager().synchronize(cmd);
                        } else if (polylines.length > 1) {
	                        var cmd = new Xr.edit.RemovePartCommand(targetLayer, id, this._idxTouchPart);

	                        this._idxTouchPart = -1;
	                        this._idxTouchVtx = -1;

	                        this.editManager().synchronize(cmd);
	                    }
	                }
	            }
	        }
	    },
	}
});