Xr.edit = Xr.edit || {};

/**  
 * @classdesc 타원체에 대한 스케치 클래스입니다.
 * @class
 * @param {Xr.managers.EditManager} editManager - 편집 관리자 클래스 객체
 * @param {Xr.data.EllipseShapeData} shapeData - 타원체를 구성하는 실제 정보에 대한 클래스 객체
 * @param {int} id - 고유 식별자 Id
 * @param {boolean} isNew - 신규 생성인지의 여부를 나타냅니다.
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.edit.EllipseSketch = Xr.Class({
    name: "EllipseSketch",
    extend: Xr.edit.Sketch,
    requires: [Xr.edit.ISketch, Xr.IMouseInteraction, Xr.IKeyboardInteraction],

    construct: function (/* EditManager */ editManager, /* EllipseShapeData */ shapeData, /* int */ id, /* boolean */ isNew, /* boolean */ bMeasured) {
        Xr.edit.Sketch.call(this, editManager, shapeData, id, isNew);
        this._bTouchBody = false;
        this._idxTouchControl = -1;
        this._bMeasured = bMeasured;
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

	        if (this._bMeasured) {
	            var g_measured = document.createElementNS(xmlns, "g");
	                var wpa = new Xr.PointD((maxX + minX) / 2, maxY);
	                var wpb = new Xr.PointD(maxX, (maxY + minY) / 2);

	                var vpa = coordMapper.W2V(wpa);
	                var vpb = coordMapper.W2V(wpb);

	                var a = maxX - minX;
	                var b = maxY - minY;

	                var txtSvga = Xr.OperationHelper.strokeTextSvg(vpa.x, vpa.y, a.toFixed(2) + "m", 18, "#ffffff", "#313131", 4);
	                var txtSvgb = Xr.OperationHelper.strokeTextSvg(vpb.x, vpb.y, b.toFixed(2) + "m", 18, "#ffffff", "#313131", 4, 90);

	                g_measured.appendChild(txtSvga);
	                g_measured.appendChild(txtSvgb);
	            group.appendChild(g_measured);
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
	            //var mouseDownMapPt = Xr.UserState.snapMapPt;
                var mouseDownMapPt = coordMapper.mouseState.snapMapPt;

	            data.cx = mouseDownMapPt.x;
	            data.cy = mouseDownMapPt.y;
                
	            return false; // 신규 생성이므로 기존의 Sketch가 없어 기존의 Sketch를 건드리지 않았음을 의미하는 false.
	        } else {

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
            var mouseState = coordMapper.mouseState;

	        if (this.isNew()) {
	            //if (Xr.UserState.mouseDown) {
                if (mouseState.bDown) {
                    //var moveMapPt = Xr.UserState.snapMapPt;
                    var moveMapPt = mouseState.snapMapPt;
                    data.rx = Math.abs(data.cx - moveMapPt.x);
	                data.ry = Math.abs(data.cy - moveMapPt.y);                    
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
            var mouseState = coordMapper.mouseState;
	        //var endPt = Xr.UserState.snapMapPt;
            var endPt = mouseState.snapMapPt;
            //var startPt = Xr.UserState.mouseDownMapSnapPt;
            var startPt = mouseState.downMapSnapPt;
            var deltaX = endPt.x - startPt.x;
	        var deltaY = endPt.y - startPt.y;
	        var targetLayer = this.editManager().targetGraphicLayer();
	        var data = this.shapeData().data();

	        if (this.isNew()) {
	            var targetLayer = this.editManager().targetGraphicLayer();
	            var id = this.id();
	            var graphicRow = new Xr.data.EllipseGraphicRow(id, this.shapeData(), this._bMeasured);

	            graphicRow.penSymbol().color('#383838').width(3);
	            graphicRow.brushSymbol().color('#000000').opacity(0.6);

	            var cmd = new Xr.edit.NewCommand(targetLayer, this.id(), graphicRow);
                

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