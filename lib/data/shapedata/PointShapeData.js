Xr.data = Xr.data || {};

/**  
 * @classdesc 포인트 그래픽 Row에 대한 도형 정보 값을 담고 있는 클래스입니다. 
 * @class
 * @param {Xr.MBR} arg - 포인트에 대한 MBR 객체(Selective-Paramter)
 * @param {Xr.PointD} arg - 포인트의 좌표(Selective-Paramter)
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */
Xr.data.PointShapeData = Xr.Class({
	name: "PointShapeData",
	requires: [Xr.data.IShapeData, Xr.edit.ISnap],

	construct: function (/* MBR or PointD */ arg) {
        if (arg instanceof Xr.MBR) {
	        this._mbr = arg;
	        this._point = new Xr.PointD(arg.minX, arg.minY);
	    } else if (arg instanceof Xr.PointD) {
	        this._mbr = new Xr.MBR(arg.x, arg.y, arg.x, arg.y);
	        this._point = new Xr.PointD(arg.x, arg.y);
	    }
	},

	methods: {
	    /* boolean */ hitTest: function (/* number */ x, /* number */ y, /* CoordMapper */ cm, /* optional Xr.symbol.IMarkerSymbol*/ markerSym) {
	        var tol = cm.pickingTolerance() / 2;
	        var point = this.data();
	        var coord = cm.V2W(x, y);
	        var mwSize = 0;
	        var mhSize = 0;

	        if (markerSym) {
	            var wSize = markerSym.wSize();
	            var hSize = markerSym.hSize();
	            mwSize = cm.mapLength(wSize);
	            mhSize = cm.mapLength(hSize);
	        }

	        // new method
	        var cx = point.x;
	        var cy = point.y;
	        var minX = cx - tol - mwSize / 2;
	        var maxX = cx + tol + mwSize / 2;
	        var minY = cy - tol - mhSize / 2;
	        var maxY = cy + tol + mhSize / 2;

	        return minX <= coord.x && maxX >= coord.x && minY <= coord.y && maxY >= coord.y;

            // old method
	        //var dist = Math.sqrt(Math.pow(point.x - coord.x, 2.0) + Math.pow(point.y - coord.y, 2.0));
	        //return (dist <= tol);
	    },

	    /* ShapeData */ clone: function () {
	        var pt = new Xr.PointD(this._point.x, this._point.y);
	        var newThing = new Xr.data.PointShapeData(pt);
	        return newThing;
	    },

		/* PointD */ data: function() { 
			return this._point;
		},
		
		MBR: function () {
			return this._mbr;
		},

		representativePoint: function () {
		    return this._point;
		},

	    /* Object {pt:PointD, angle:float}  */ representativePointWithAngle: function () {
	        return null;
	    },

	    /* int */ type: function () {
	        return Xr.data.ShapeType.POINT;
	    },

	    /* ISkecth */ toSketch: function (/* EditManager */ editManager, /* int */ id, /* boolean */ bMeasured) {
	        var sketch = new Xr.edit.PointSketch(editManager, this, id, false);
	        return sketch;
	    },

	    moveByOffset: function (/* number */ deltaX, /* number */ deltaY) {
	        this._point.add(deltaX, deltaY);

	        this._mbr.moveByOffset(deltaX, deltaY);
	    },

	    updateControlPoint: function (/* int */ partIndex, /* int */ controlPointIndex, /* PointD */ newPt, /* ouput PointD */ oldPt) {
	        if (oldPt) oldPt.set(this._point.x, this._point.y);

	        this._point.set(newPt.x, newPt.y);

	        this._mbr.set(newPt.x, newPt.y, newPt.x, newPt.y);
	    },

	    moveControlPointByOffset: function (/* int */ partIndex, /* int */ controlPointIndex, /* number */ deltaX, /* number */ deltaY) {
	        //.
	    },

	    /* PointD */ removeVertex: function (/* int */ partIndex, /* int */ controlPointIndex) { },
	    insertVertex: function (/* int */ partIndex, /* int */ controlPointIndex, /* PointD */ vtx) { },
	    insertPart: function (/* int */ partIndex, /* Array of PointD */ pointList) { },
	    /* Array of PointD */ removePart: function (/* int */ partIndex) { },

	    /* PointD */ vertexSnap: function (/* PointD */ mapPt, /* number */ tol) {
	        var pt = this._point;

	        if (Xr.GeometryHelper.pointIn(pt.x, pt.y, tol, mapPt)) {
	            return pt;
	        }

	        return undefined;
	    },

	    /* PointD */ edgeSnap: function (/* PointD */ mapPt, /* number */ tol) { return undefined },

	    /* string */ toWKT: function (/* boolean */ bMulti) {
	        var result = "(" + this._point.x + " " + this._point.y + ")";

	        if (bMulti) {
	            result = "MULTIPOINT(" + result +")";
	        } else {
	            result = "POINT" + result;
	        }

	        return result;
	    },

	    /* boolean */ fromWKT: function (/* String */ wkt) {
	        return false;
	    }
	}
});