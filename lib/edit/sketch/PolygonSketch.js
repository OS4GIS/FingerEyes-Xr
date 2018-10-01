Xr.edit = Xr.edit || {};

/**  
 * @classdesc 폴리곤에 대한 스케치 클래스입니다.
 * @class
 * @param {Xr.managers.EditManager} editManager - 편집 관리자 클래스 객체
 * @param {Xr.data.PolygonShapeData} shapeData - 폴리곤을 구성하는 실제 정보에 대한 클래스 객체
 * @param {int} id - 고유 식별자 Id
 * @param {boolean} isNew - 신규 생성인지의 여부를 나타냅니다.
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.edit.PolygonSketch = Xr.Class({
    name: "PolygonSketch",
	extend: Xr.edit.Sketch,
	requires: [Xr.edit.ISketch, Xr.IMouseInteraction, Xr.IKeyboardInteraction],

	construct: function (/* EditManager */ editManager, /* PolygonShapeData */ shapeData, /* int */ id, /* boolean */ isNew, /* boolean */ bMeasured) {
	    Xr.edit.Sketch.call(this, editManager, shapeData, id, isNew);

	    this._bTouchBody = false;
	    this._idxTouchPart = -1;
	    this._idxTouchVtx = -1;
	    this._bMeasured = bMeasured;
	},
 	
	methods: {
	    /* SVG Element */ createSVG: function (/* CoordMapper */ coordMapper) {
	        var xmlns = Xr.CommonStrings.SVG_NAMESPACE;
	        var polygons = this.shapeData().data();	
	        var ringCount = polygons.length;
			
	        var d = "";

	        for (var iRing = 0; iRing < ringCount; ++iRing) {
	            var polygon = polygons[iRing];
	            var vertexCount = polygon.length;
	            for(var iVtx=0; iVtx<vertexCount; ++iVtx) {
	                var wp = polygon[iVtx];	
	                var vp = coordMapper.W2V(wp);

	                if(iVtx == 0) {
	                    d += " M " + (vp.x) + " " + (vp.y);
	                } else {
	                    d += " L " + (vp.x) + " " + (vp.y);
	                }
	            }

	            d += " Z";
	        }

	        var pathSVG = document.createElementNS(xmlns, "path");
	        pathSVG.setAttribute("d", d);
	        pathSVG.setAttribute("stroke", "#00ffff");
	        pathSVG.setAttribute("stroke-width", "3");
	        pathSVG.setAttribute("stroke-opacity", "0.5");
	        pathSVG.setAttribute("fill", "#00ffff");
	        pathSVG.setAttribute("stroke-linecap", "butt");
	        pathSVG.setAttribute("fill-rule", "evenodd");
	        pathSVG.setAttribute("fill-opacity", "0.5");
	        
	        var group = document.createElementNS(xmlns, "g");
	        group.appendChild(pathSVG);

	        if (!this.isNew()) {
	            for (var iRing = 0; iRing < ringCount; ++iRing) {
	                var polygon = polygons[iRing];
	                var vertexCount = polygon.length;
	                for (var iVtx = 0; iVtx < vertexCount; ++iVtx) {
	                    var wp = polygon[iVtx];
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

	        if (this._bMeasured) {
	            var g_measured = document.createElementNS(xmlns, "g");
	            for (var iRing = 0; iRing < ringCount; ++iRing) {
	                var polygon = polygons[iRing];
	                var vertexCount = polygon.length;

	                if (vertexCount < 4) continue;

                    var wp = Xr.GeometryHelper.centroidOfPolygon(polygon);
                    if (wp) {
                        var vp = coordMapper.W2V(wp);
                        var area = Math.abs(Xr.GeometryHelper.signedArea(polygon));

                        var txtSvg = Xr.OperationHelper.strokeTextSvg(vp.x, vp.y, area.toFixed(2) + "㎡", 24, "#ffffff", "#313131", 6);
                        g_measured.appendChild(txtSvg);
                    }
	            }

	            group.appendChild(g_measured);
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
	            //var mouseDownMapPt = Xr.UserState.snapMapPt;
                var mouseDownMapPt = coordMapper.mouseState.snapMapPt;

	            var polygons = this.shapeData().data();
	            var cntPolygon = polygons.length;

	            this._bTouchBody = false;
	            this._idxTouchPart = -1;
	            this._idxTouchVtx = -1;

	            for (var iPart = 0; iPart < cntPolygon; iPart++) {
	                var polygon = polygons[iPart];
	                var cntPts = polygon.length;
	                for (var i = 0; i < cntPts; i++) {
	                    var pt = coordMapper.W2V(polygon[i]);
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
	        var polygons = this.shapeData().data();
	        var coordMapper = this._editManager.coordMapper();
            var mouseState = coordMapper.mouseState;

	        if (this.isNew()) {
	            var polygon = polygons[polygons.length - 1];
	            var cntPts = polygon.length;

	            if (cntPts > 0) {
	                //var pt = Xr.UserState.snapMapPt;
                    var pt = mouseState.snapMapPt;

	                if (cntPts > 1) { polygon.pop(); }
	                polygon.push(pt);
	            }

	            this.update();
	        } else {
                //var endPt = Xr.UserState.snapMapPt;
                var endPt = mouseState.snapMapPt;
                //var startPt = Xr.UserState.mouseDownAndMoveMapSnapPt;
                var startPt = mouseState.downAndMoveMapSnapPt;
                var deltaX = endPt.x - startPt.x;
	            var deltaY = endPt.y - startPt.y;

	            if (this._bTouchBody) {	                
	                var cntPolygons = polygons.length;
	                for (var iPart = 0; iPart < cntPolygons; iPart++) {
	                    var polygon = polygons[iPart];
	                    var cntPts = polygon.length;
	                    for (var iVtx = 0; iVtx < cntPts; iVtx++) {
	                        polygon[iVtx].add(deltaX, deltaY);
	                    }
	                }

	                this.update();
	            } else if(this._idxTouchPart != -1 && this._idxTouchVtx != -1) {
	                var polygon = polygons[this._idxTouchPart];
	                var pt = polygon[this._idxTouchVtx];
	                //pt.add(deltaX, deltaY);
	                pt.set(endPt.x, endPt.y);

	                this.update();
	            }
	        }
	    },

	    mouseUp: function (e) {
            var coordMapper = this._editManager.coordMapper();
            var mouseState = coordMapper.mouseState;
	        var polygons = this.shapeData().data();
	        //var endPt = Xr.UserState.snapMapPt;
            var endPt = mouseState.snapMapPt;
            //var startPt = Xr.UserState.mouseDownMapSnapPt;
            var startPt = mouseState.downMapSnapPt;
            var deltaX = endPt.x - startPt.x;
	        var deltaY = endPt.y - startPt.y;
	        var targetLayer = this.editManager().targetGraphicLayer();

	        if (this.isNew()) {
	            var polygon = polygons[polygons.length - 1];
                //var pt = Xr.UserState.snapMapPt;
                var pt = mouseState.snapMapPt;
                polygon.push(pt);

	            this.update(); 
	        } else if (this._idxTouchPart != -1 && this._idxTouchVtx != -1) {
	            var cmd = new Xr.edit.UpdateControlPointCommand(targetLayer, this.id(), this._idxTouchPart, this._idxTouchVtx, endPt);

	            this._idxTouchPart = -1;
	            this._idxTouchVtx = -1;

	            this.editManager().synchronize(cmd);
	        } else if (e.ctrlKey) {
	            //var pt = Xr.UserState.snapMapPt;
                var pt = mouseState.snapMapPt;
                var tol = coordMapper.snappingTolerance();
	            var cntPolygons = polygons.length;
	            var idxInserted = -1;
	            var intPt = undefined;

	            for (var iPart = 0; iPart < cntPolygons; iPart++) {
	                polygon = polygons[iPart];
	                var cntVtx = polygon.length - 1;
	                for (var iVtx = 0; iVtx < cntVtx; iVtx++) {
	                    var p1 = polygon[iVtx];
	                    var p2 = polygon[iVtx + 1];
	                    var intPt = Xr.GeometryHelper.intersectPointFromLine(p1, p2, pt, tol);
	                    if (intPt) {
	                        idxInserted = iVtx + 1;
	                        break;
	                    }
	                }

	                if (!intPt) {
	                    intPt = Xr.GeometryHelper.intersectPointFromLine(polygon[0], polygon[cntVtx], pt, tol);
	                    if (intPt) {
	                        idxInserted = cntVtx + 1;
	                    }
	                }

	                if (intPt) {
	                    var cmd = new Xr.edit.AddVertexCommand(targetLayer, this.id(), iPart, idxInserted, intPt);
	                    this.editManager().synchronize(cmd);
	                    return;
	                }
	            }

	            if(!intPt) {
	                polygons.push([pt]);
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
	            var polygons = this.shapeData().data();
	            var polygon = polygons[polygons.length - 1];
	            if (polygon.length >= (3 + 2)) { // 2 are dummy vertices.
	                polygon.pop();
	                polygon.pop();

	                var targetLayer = this.editManager().targetGraphicLayer();
	                var id = this.id();

	                if (polygons.length == 1) { // Add New Row
	                    var graphicRow = new Xr.data.PolygonGraphicRow(id, this.shapeData(), this._bMeasured);

	                    graphicRow.penSymbol().color('#ffff00').width(3);
	                    graphicRow.brushSymbol().color('#000000').opacity(0.6);

	                    var cmd = new Xr.edit.NewCommand(targetLayer, this.id(), graphicRow);
	                    this.editManager().synchronize(cmd);
	                } else { // Add New Part
	                    var cmd = new Xr.edit.AddPartCommand(targetLayer, this.id(), polygon);
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
                            if (this.shapeData().data().length > 1) {
                                var cmd = new Xr.edit.RemoveCommand(targetLayer, id, row);
                                this.editManager().synchronize(cmd);
                            }
	                    }
	                } else if (this._idxTouchPart != -1 && this._idxTouchVtx != -1) {
	                    var polygons = this.shapeData().data();
	                    var polygon = polygons[this._idxTouchPart];
	                    if (polygon.length > 3) {
	                        var cmd = new Xr.edit.RemoveVertexCommand(targetLayer, id, this._idxTouchPart, this._idxTouchVtx);

	                        this._idxTouchPart = -1;
	                        this._idxTouchVtx = -1;

	                        this.editManager().synchronize(cmd);
                        } else if (polygons.length > 1) {
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