Xr.edit = Xr.edit || {};

/**  
 * @classdesc 사각형에 대한 스케치 클래스입니다.
 * @class
 * @param {Xr.managers.EditManager} editManager - 편집 관리자 클래스 객체
 * @param {Xr.data.RectangleShapeData} shapeData - 사각형을 구성하는 실제 정보에 대한 클래스 객체
 * @param {int} id - 고유 식별자 Id
 * @param {boolean} isNew - 신규 생성인지의 여부를 나타냅니다.
 * @copyright GEOSERVICE.CO.KR
 * @license GPL
 */
Xr.edit.RectangleSketch = Xr.Class({
    name: "RectangleSketch",
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
	        var mbr = this.shapeData().data();

	        var minX = mbr.minX;
	        var minY = mbr.minY;
	        var maxX = mbr.maxX;
	        var maxY = mbr.maxY;

	        if (mbr.minX > mbr.maxX) {
	            minX = mbr.maxX;
	            maxX = mbr.minX;
	        }

	        if (mbr.minY > mbr.maxY) {
	            minY = mbr.maxY;
	            maxY = mbr.minY;
	        }

	        var lt = coordMapper.W2V(new Xr.PointD(minX, maxY));
	        var rb = coordMapper.W2V(new Xr.PointD(maxX, minY));
	        var rectSvg = document.createElementNS(xmlns, "rect");

	        rectSvg.setAttribute("x", lt.x);
	        rectSvg.setAttribute("y", lt.y);
	        rectSvg.setAttribute("width", rb.x - lt.x);
	        rectSvg.setAttribute("height", rb.y - lt.y);

	        rectSvg.setAttribute("stroke", "#00ffff");
	        rectSvg.setAttribute("stroke-width", "3");
	        rectSvg.setAttribute("stroke-opacity", "0.5");
	        rectSvg.setAttribute("fill", "#00ffff");
	        rectSvg.setAttribute("stroke-linecap", "butt");
	        rectSvg.setAttribute("fill-opacity", "0.5");
	        
	        var group = document.createElementNS(xmlns, "g");
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

	        var rectMbr = this.shapeData().data();

	        if (this.isNew()) {
	            var mouseDownMapPt = Xr.UserState.snapMapPt;
	            rectMbr.minX = mouseDownMapPt.x;
	            rectMbr.minY = mouseDownMapPt.y;
	            return false; // 신규 생성이므로 기존의 Sketch가 없어 기존의 Sketch를 건드리지 않았음을 의미하는 false.
	        } else {
	            var coordMapper = this._editManager.coordMapper();
	            var mouseDownPt = new Xr.PointD(mouseX, mouseY);
	            var lt = coordMapper.W2V(new Xr.PointD(rectMbr.minX, rectMbr.maxY));
	            var rb = coordMapper.W2V(new Xr.PointD(rectMbr.maxX, rectMbr.minY));

	            this._bTouchBody = false;
	            this._idxTouchControl = -1;

	            if (Xr.GeometryHelper.pointIn(lt.x, lt.y, 7, mouseDownPt)) this._idxTouchControl = 0;
	            else if (Xr.GeometryHelper.pointIn((lt.x + rb.x) / 2, lt.y, 7, mouseDownPt)) this._idxTouchControl = 1;
	            else if (Xr.GeometryHelper.pointIn(rb.x, lt.y, 7, mouseDownPt)) this._idxTouchControl = 2;
	            else if (Xr.GeometryHelper.pointIn(rb.x, (lt.y + rb.y) / 2, 7, mouseDownPt)) this._idxTouchControl = 3;
	            else if (Xr.GeometryHelper.pointIn(rb.x, rb.y, 7, mouseDownPt)) this._idxTouchControl = 4;
	            else if (Xr.GeometryHelper.pointIn((lt.x + rb.x) / 2, rb.y, 7, mouseDownPt)) this._idxTouchControl = 5;
	            else if (Xr.GeometryHelper.pointIn(lt.x, rb.y, 7, mouseDownPt)) this._idxTouchControl = 6;
	            else if (Xr.GeometryHelper.pointIn(lt.x, (lt.y + rb.y) / 2, 7, mouseDownPt)) this._idxTouchControl = 7;
                else this._bTouchBody = this.shapeData().hitTest(mouseX, mouseY, coordMapper);

	            return this._bTouchBody || this._idxTouchControl != -1; // Sketch를 건드렸는지
	        }
	    },

	    mouseMove: function (e) {
	        var rectMbr = this.shapeData().data();
	        var coordMapper = this._editManager.coordMapper();

	        if (this.isNew()) {
	            if (Xr.UserState.mouseDown) {
	                var moveMapPt = Xr.UserState.snapMapPt;
	                rectMbr.maxX = moveMapPt.x;
	                rectMbr.maxY = moveMapPt.y;
	            }

	            this.update();
	        } else {
	            var endPt = Xr.UserState.snapMapPt;
	            var startPt = Xr.UserState.mouseDownAndMoveMapSnapPt;
	            
	            var deltaX = endPt.x - startPt.x;
	            var deltaY = endPt.y - startPt.y;

	            if (this._bTouchBody) {	                
	                rectMbr.moveByOffset(deltaX, deltaY);
	                this.update();
	            } else if (this._idxTouchControl != -1) {
	                if (this._idxTouchControl == 0) {
	                    rectMbr.minX = endPt.x;
	                    rectMbr.maxY = endPt.y;
	                } else if (this._idxTouchControl == 1) {
	                    rectMbr.maxY = endPt.y;
	                } else if (this._idxTouchControl == 2) {
	                    rectMbr.maxX = endPt.x;
	                    rectMbr.maxY = endPt.y;
	                } else if (this._idxTouchControl == 3) {
	                    rectMbr.maxX = endPt.x;
	                } else if (this._idxTouchControl == 4) {
	                    rectMbr.maxX = endPt.x;
	                    rectMbr.minY = endPt.y;
	                } else if (this._idxTouchControl == 5) {
	                    rectMbr.minY = endPt.y;
	                } else if (this._idxTouchControl == 6) {
	                    rectMbr.minX = endPt.x;
	                    rectMbr.minY = endPt.y;
	                } else if (this._idxTouchControl == 7) {
	                    rectMbr.minX = endPt.x;
	                }

	                this.update();
	            }
	        }
	    },

	    mouseUp: function (e) {
	        var coordMapper = this._editManager.coordMapper();
	        var endPt = Xr.UserState.snapMapPt;
	        var startPt = coordMapper.V2W(Xr.UserState.mouseDownPt.x, Xr.UserState.mouseDownPt.y);
	        var offsetXY = Xr.OperationHelper.offsetXY(e);
	        var xy = coordMapper.V2W(offsetXY.x, offsetXY.y);

	        var deltaX = endPt.x - startPt.x;
	        var deltaY = endPt.y - startPt.y;
	        var targetLayer = this.editManager().targetGraphicLayer();

	        if (this.isNew()) {
	            var rectMbr = this.shapeData().data();
	            var targetLayer = this.editManager().targetGraphicLayer();
	            var id = this.id();

	            var graphicRow = new Xr.data.RectangleGraphicRow(id, this.shapeData());

	            graphicRow.penSymbol().color('#383838');
	            graphicRow.penSymbol().width(3);
	            graphicRow.brushSymbol().color('#cecece');

	            var cmd = new Xr.edit.NewCommand(targetLayer, this.id(), graphicRow);

	            this.editManager().synchronize(cmd);
	        } else if (this._idxTouchControl != -1) {
	            var cmd = new Xr.edit.UpdateControlPointCommand(targetLayer, this.id(), 0, this._idxTouchControl, endPt);

	            this._idxTouchControl = -1;
	            this.shapeData().data().valid();

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