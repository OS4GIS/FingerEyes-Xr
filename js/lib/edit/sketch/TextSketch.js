Xr.edit = Xr.edit || {};

/**  
 * @classdesc 텍스트에 대한 스케치 클래스입니다.
 * @class
 * @param {Xr.managers.EditManager} editManager - 편집 관리자 클래스 객체
 * @param {Xr.data.TextShapeData} shapeData - 텍스트를 구성하는 실제 정보에 대한 클래스 객체
 * @param {int} id - 고유 식별자 Id
 * @param {boolean} isNew - 신규 생성인지의 여부를 나타냅니다.
 * @copyright GEOSERVICE.CO.KR
 * @license LGPL
 */
Xr.edit.TextSketch = Xr.Class({
    name: "TextSketch",
	extend: Xr.edit.Sketch,
	requires: [Xr.edit.ISketch, Xr.IMouseInteraction, Xr.IKeyboardInteraction],

	construct: function (/* EditManager */ editManager, /* TextShapeData */ shapeData, /* int */ id, /* boolean */ isNew) {
	    Xr.edit.Sketch.call(this, editManager, shapeData, id, isNew);
	    this._bTouchBody = false;
	},
 	
	methods: {
	    /* SVG Element */ createSVG: function (/* CoordMapper */ coordMapper) {
	        var xmlns = Xr.CommonStrings.SVG_NAMESPACE;
	        var data = this.shapeData().data();	
	        var pt = new Xr.PointD(data.x, data.y);
	        var vp = coordMapper.W2V(pt);
	        var ellipSvg = document.createElementNS(xmlns, "ellipse");

	        ellipSvg.setAttribute("cx", vp.x);
	        ellipSvg.setAttribute("cy", vp.y);
	        ellipSvg.setAttribute("rx", 5);
	        ellipSvg.setAttribute("ry", 5);

	        ellipSvg.setAttribute("stroke", "#ffffff");
	        ellipSvg.setAttribute("stroke-width", "3");
	        ellipSvg.setAttribute("stroke-opacity", "1");
	        ellipSvg.setAttribute("fill", "#000000");
	        ellipSvg.setAttribute("fill-opacity", "1");

	        var group = document.createElementNS(xmlns, "g");
	        group.appendChild(ellipSvg);

	        this._drawSnapCursor(coordMapper, group);

	        return group;
	    },

	    mouseDown: function (e) {
	        if (!this.isNew() && !e.ctrlKey) {
	            var offsetXY = Xr.OperationHelper.offsetXY(e);
	            var mouseX = offsetXY.x;
	            var mouseY = offsetXY.y;

	            var coordMapper = this._editManager.coordMapper();
	            this._bTouchBody = this.shapeData().hitTest(mouseX, mouseY, coordMapper);

	            return this._bTouchBody;
	        } else {
	            return false; // 신규 생성이므로 기존의 Sketch가 없어 기존의 Sketch를 건드리지 않았음을 의미하는 false.
	        }
	    },

	    mouseMove: function (e) {
	        var data = this.shapeData().data();
	        var coordMapper = this._editManager.coordMapper();

	        if (this.isNew()) {
	            var pt = Xr.UserState.snapMapPt;
	            data.x = pt.x;
	            data.y = pt.y;

	            this.update();
	        } else {
	            var endPt = Xr.UserState.snapMapPt;
	            var startPt = Xr.UserState.mouseDownAndMoveMapSnapPt;
	            var deltaX = endPt.x - startPt.x;
	            var deltaY = endPt.y - startPt.y;

	            if (this._bTouchBody) {
	                this.shapeData().updateControlPoint(0, 0, endPt);
	                this.update();
	            }
	        }
	    },

	    mouseUp: function (e) {
	        var coordMapper = this._editManager.coordMapper();
	        
	        if (this.isNew()) {
	            var data = this.shapeData().data();
	            var offsetXY = Xr.OperationHelper.offsetXY(e);
	            var pt = coordMapper.V2W(offsetXY.x, offsetXY.y);

	            data.x = pt.x;
	            data.y = pt.y;

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
	            var graphicRow = new Xr.data.TextGraphicRow(id, this.shapeData());

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
	                var targetLayer = this.editManager().targetGraphicLayer();
	                var id = this.id();

	                if (this._bTouchBody) {
	                    var row = targetLayer.rowSet().row(id);
	                    if (row) {
	                        var cmd = new Xr.edit.RemoveCommand(targetLayer, id, row);
	                        this.editManager().synchronize(cmd);
	                    }
	                }
	            }
	        }
	    },
	}
});