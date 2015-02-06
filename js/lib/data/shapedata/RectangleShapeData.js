Xr.data = Xr.data || {};

/**  
 * @classdesc 사각형 그래픽 Row에 대한 도형 정보 값을 담고 있는 클래스입니다. 
 * @class
 * @param {Xr.MBR} arg - 사각형에 대한 MBR 객체
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */
Xr.data.RectangleShapeData = Xr.Class({
    name: "RectangleShapeData",
    requires: [Xr.data.IShapeData, Xr.edit.ISnap],

	construct: function (/* MBR */ arg) {
	    this._data = arg;
	    this._data.valid();
	},

	methods: {
	    /* boolean */ hitTest: function (/* number */ x, /* number */ y, /* CoordMapper */ cm) {
	        var mbr = this.data();
	        var coord = cm.V2W(x, y);

	        return Xr.GeometryHelper.pointInMBR(mbr, coord, 0);
	    },

	    /* ShapeData */ clone: function () {
	        var newThing = new Xr.data.RectangleShapeData(this._data.clone());
	        return newThing;
	    },

		data: function() { 
		    return this._data;
		},

		MBR: function () {
		    return this._data;
		},

		/* PointD */ representativePoint: function () {
		    return new Xr.PointD(_data.centerX(), _data.centerY());
		},

	    /* String */ type: function () {
	        return "RECTANGLE";
	    },

	    /* ISkecth */ toSketch: function (/* EditManager */ editManager, /* int */ id) {
	        var sketch = new Xr.edit.RectangleSketch(editManager, this, id, false);
	        return sketch;
	    },

	    moveByOffset: function (/* number */ deltaX, /* number */ deltaY) {
	        this._data.moveByOffset(deltaX, deltaY);
	    },

	    //
	    //  this._idxTouchControl's value
	    //
	    //  0----1----2
	    //  |         |
	    //  |         |
	    //  7         3
	    //  |         |
	    //  |         |
	    //  6----5----4
	    //

	    _getControlPointIndexFromPt: function(/* number */ cpx, /* number */ cpy) {
	        var mbr = this._data;

	        if (cpx == mbr.minX && cpy == mbr.maxY) return 0;
	        else if(cpx == mbr.centerX() && cpy == mbr.maxY) return 1;
	        else if (cpx == mbr.maxX && cpy == mbr.maxY) return 2;
	        else if (cpx == mbr.maxX && cpy == mbr.centerY()) return 3;
	        else if (cpx == mbr.maxX && cpy == mbr.minY) return 4;
	        else if (cpx == mbr.centerX() && cpy == mbr.minY) return 5;
	        else if (cpx == mbr.minX && cpy == mbr.minY) return 6;
	        else if (cpx == mbr.minX && cpy == mbr.centerY()) return 7;

	        return undefined;
	    },

	    updateControlPoint: function (/* int */ partIndex, /* int */ controlPointIndex, /* PointD */ newPt, /* ouput PointD */ oldPt) {
	        var mbr = this._data;
	        var cpx, cpy;
	        if (controlPointIndex == 0) {
	            if (oldPt) oldPt.set(mbr.minX, mbr.maxY);

	            mbr.minX = newPt.x;
	            mbr.maxY = newPt.y;

	            cpx = mbr.minX;
	            cpy = mbr.maxY;
	        } else if (controlPointIndex == 1) {
	            if (oldPt) oldPt.set(mbr.centerX(), mbr.maxY);

	            mbr.maxY = newPt.y;

	            cpx = mbr.centerX();
	            cpy = mbr.maxY;
	        } else if (controlPointIndex == 2) {
	            if (oldPt) oldPt.set(mbr.maxX, mbr.maxY);

	            mbr.maxX = newPt.x;
	            mbr.maxY = newPt.y;

	            cpx = mbr.maxX;
	            cpy = mbr.maxY;
	        } else if (controlPointIndex == 3) {
	            if (oldPt) oldPt.set(mbr.maxX, mbr.centerY);

	            mbr.maxX = newPt.x;

	            cpx = mbr.maxX;
	            cpy = mbr.centerY();
	        } else if (controlPointIndex == 4) {
	            if (oldPt) oldPt.set(mbr.maxX, mbr.minY);

	            mbr.maxX = newPt.x;
	            mbr.minY = newPt.y;

	            cpx = mbr.maxX;
	            cpy = mbr.minY;
	        } else if (controlPointIndex == 5) {
	            if (oldPt) oldPt.set(mbr.centerX, mbr.minY);

	            mbr.minY = newPt.y;

	            cpx = mbr.centerX();
	            cpy = mbr.minY;
	        } else if (controlPointIndex == 6) {
	            if (oldPt) oldPt.set(mbr.minX, mbr.minY);

	            mbr.minX = newPt.x;
	            mbr.minY = newPt.y;

	            cpx = mbr.minX;
	            cpy = mbr.minY;
	        } else if (controlPointIndex == 7) {
	            if (oldPt) oldPt.set(mbr.minX, mbr.centerY);

	            mbr.minX = newPt.x;

	            cpx = mbr.minX;
	            cpy = mbr.centerY();
	        }

	        this._data.valid();

	        return this._getControlPointIndexFromPt(cpx, cpy);
	    },

	    moveControlPointByOffset: function (/* int */ partIndex, /* int */ controlPointIndex, /* number */ deltaX, /* number */ deltaY) {
	        var mbr = this._data;
	        var cpx, cpy;
	        if (controlPointIndex == 0) {
	            mbr.minX += deltaX;
	            mbr.maxY += deltaY;

	            cpx = mbr.minX;
	            cpy = mbr.maxY;
	        } else if (controlPointIndex == 1) {
	            mbr.maxY += deltaY;

	            cpx = mbr.centerX();
	            cpy = mbr.maxY;
	        } else if (controlPointIndex == 2) {
	            mbr.maxX += deltaX;
	            mbr.maxY += deltaY;

	            cpx = mbr.maxX;
	            cpy = mbr.maxY;
	        } else if (controlPointIndex == 3) {
	            mbr.maxX += deltaX;

	            cpx = mbr.maxX;
	            cpy = mbr.centerY();
	        } else if (controlPointIndex == 4) {
	            mbr.maxX += deltaX;
	            mbr.minY += deltaY;

	            cpx = mbr.maxX;
	            cpy = mbr.minY;
	        } else if (controlPointIndex == 5) {
	            mbr.minY += deltaY;

	            cpx = mbr.centerX();
	            cpy = mbr.minY;
	        } else if (controlPointIndex == 6) {
	            mbr.minX += deltaX;
	            mbr.minY += deltaY;

	            cpx = mbr.minX;
	            cpy = mbr.minY;
	        } else if (controlPointIndex == 7) {
	            mbr.minX += deltaX;

	            cpx = mbr.minX;
	            cpy = mbr.centerY();
	        }

	        this._data.valid();

	        return this._getControlPointIndexFromPt(cpx, cpy);
	    },

	    /* PointD */ removeVertex: function (/* int */ partIndex, /* int */ controlPointIndex) { },
	    insertVertex: function (/* int */ partIndex, /* int */ controlPointIndex, /* PointD */ vtx) { },
	    insertPart: function (/* int */ partIndex, /* Array of PointD */ pointList) { },
	    /* Array of PointD */ removePart: function (/* int */ partIndex) { },

	    /* PointD */ vertexSnap: function (/* PointD */ mapPt, /* number */ tol) {
	        var pt = undefined;//new Xr.PointD(this._data.x, this._data.y);
	        var mbr = this._data;

	        pt = new Xr.PointD(mbr.minX, mbr.maxY);
	        if (Xr.GeometryHelper.pointIn(pt.x, pt.y, tol, mapPt)) {
	            return pt;
	        }

	        pt = new Xr.PointD(mbr.centerX(), mbr.maxY);
	        if (Xr.GeometryHelper.pointIn(pt.x, pt.y, tol, mapPt)) {
	            return pt;
	        }

	        pt = new Xr.PointD(mbr.maxX, mbr.maxY);
	        if (Xr.GeometryHelper.pointIn(pt.x, pt.y, tol, mapPt)) {
	            return pt;
	        }

	        pt = new Xr.PointD(mbr.maxX, mbr.centerY());
	        if (Xr.GeometryHelper.pointIn(pt.x, pt.y, tol, mapPt)) {
	            return pt;
	        }

	        pt = new Xr.PointD(mbr.maxX, mbr.minY);
	        if (Xr.GeometryHelper.pointIn(pt.x, pt.y, tol, mapPt)) {
	            return pt;
	        }

	        pt = new Xr.PointD(mbr.centerX(), mbr.minY);
	        if (Xr.GeometryHelper.pointIn(pt.x, pt.y, tol, mapPt)) {
	            return pt;
	        }

	        pt = new Xr.PointD(mbr.minX, mbr.minY);
	        if (Xr.GeometryHelper.pointIn(pt.x, pt.y, tol, mapPt)) {
	            return pt;
	        }

	        pt = new Xr.PointD(mbr.minX, mbr.centerY());
	        if (Xr.GeometryHelper.pointIn(pt.x, pt.y, tol, mapPt)) {
	            return pt;
	        }
	        
	        return undefined;
	    },

	    /* PointD */ edgeSnap: function (/* PointD */ mapPt, /* number */ tol) {
	        var mbr = this._data;
	        var lb = new Xr.PointD(mbr.minX, mbr.minY);
	        var rb = new Xr.PointD(mbr.maxX, mbr.minY);
	        var lt = new Xr.PointD(mbr.minX, mbr.maxY);
	        var rt = new Xr.PointD(mbr.maxX, mbr.maxY);

	        var intPt = undefined;

	        intPt = Xr.GeometryHelper.intersectPointFromLine(lb, rb, mapPt, tol);
	        if (intPt) return intPt;

	        intPt = Xr.GeometryHelper.intersectPointFromLine(lb, lt, mapPt, tol);
	        if (intPt) return intPt;

	        intPt = Xr.GeometryHelper.intersectPointFromLine(rt, lt, mapPt, tol);
	        if (intPt) return intPt;

	        intPt = Xr.GeometryHelper.intersectPointFromLine(rt, rb, mapPt, tol);
	        if (intPt) return intPt;

	        return undefined
	    },

	    /* string */ toWKT: function (/* boolean */ bMulti) {
	        return undefined;
	    },

	    /* boolean */ fromWKT: function (/* String */ wkt) {
	        return false;
	    }
	}
});