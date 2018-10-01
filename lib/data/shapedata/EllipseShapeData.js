Xr.data = Xr.data || {};

/**  
 * @classdesc 타원체 그래픽 Row에 대한 도형 정보 값을 담고 있는 클래스입니다. 
 * @class
 * @param {Xr.MBR} arg - 타원체에 대한 MBR 객체(Selective-Paramter)
 * @param {Object} arg - 타원체를 구성하는 정보를 담고 있는 객체로 cx와 cy는 타원체의 중심점이고 rx와 ry는 각각 x축에 대한 반지름과 y축에 반지름 값(Selective-Paramter)
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */
Xr.data.EllipseShapeData = Xr.Class({
    name: "EllipseShapeData",
    requires: [Xr.data.IShapeData, Xr.edit.ISnap],

    construct: function (/* MBR or {cx,cy,rx,ry} */ arg) {
        if (arg instanceof Xr.MBR) {
            this._mbr = arg;
            this._data = { 
                cx: arg.centerX(), 
                cy: arg.centerY(), 
                rx: arg.width() / 2.0, 
                ry: arg.height() / 2.0 
            };
        } else {
            this._data = arg;
            this._mbr = new Xr.MBR(arg.cx - arg.rx, arg.cy - arg.ry, arg.cx + arg.rx, arg.cy + arg.ry);
        }
    },

    methods: {
        /* boolean */ hitTest: function (/* number */ x, /* number */ y, /* CoordMapper */ cm, /* optional Xr.symbol.IMarkerSymbol*/ markerSym) {
            var coord = cm.V2W(x, y);
	        
            var data = this.data();
            var cx = data.cx;
            var cy = data.cy;
            var vrx = data.rx;
            var vry = data.ry;

            var v = (Math.pow(coord.x - cx, 2.0) / (vrx * vrx)) + (Math.pow(coord.y - cy, 2.0) / (vry * vry));
            return v <= 1;
        },

        /* ShapeData */ clone: function () {
            this._regenMBR();

            var mbr = new Xr.MBR(this._mbr.minX, this._mbr.minY, this._mbr.maxX, this._mbr.maxY);
            var newThing = new Xr.data.EllipseShapeData(mbr);
            return newThing;
        },

        data: function() { 
            return this._data;
        },
		
        _regenMBR: function () {
            var data = this._data;
            this._mbr.set(data.cx - data.rx, data.cy - data.ry, data.cx + data.rx, data.cy + data.ry);
        },

        MBR: function () {
            return this._mbr;
        },

        /* PointD */ representativePoint: function () {
            var mbr = this._mbr;
            return new Xr.PointD(mbr.centerX(), mbr.centerY());
        },

        /* Object {pt:PointD, angle:float}  */ representativePointWithAngle: function () {
            return null;
        },

        /* int */ type: function () {
            return Xr.data.ShapeType.ELLIPSE;
        },

        /* ISkecth */ toSketch: function (/* EditManager */ editManager, /* int */ id, /* boolean */ bMeasured) {
            var sketch = new Xr.edit.EllipseSketch(editManager, this, id, false, bMeasured);
            return sketch;
        },

        moveByOffset: function (/* number */ deltaX, /* number */ deltaY) {
            this._data.cx += deltaX;
            this._data.cy += deltaY;

            this._mbr.moveByOffset(deltaX, deltaY);
        },

        updateControlPoint: function (/* int */ partIndex, /* int */ controlPointIndex, /* PointD */ newPt, /* ouput PointD */ oldPt) {
            var data = this._data;
            var cpx, cpy;

            if (oldPt) {
                oldPt.x = data.rx;
                oldPt.y = data.ry;
            }

            if (controlPointIndex == 0) {
                data.rx = newPt.x;
                data.ry = newPt.y;
            } else if (controlPointIndex == 1) {
                data.ry = newPt.y;
            } else if (controlPointIndex == 2) {
                data.rx = newPt.x;
                data.ry = newPt.y;
            } else if (controlPointIndex == 3) {
                data.rx = newPt.x;
            } else if (controlPointIndex == 4) {
                data.rx = newPt.x;
                data.ry = newPt.y;
            } else if (controlPointIndex == 5) {
                data.ry = newPt.y;
            } else if (controlPointIndex == 6) {
                data.rx = newPt.x;
                data.ry = newPt.y;
            } else if (controlPointIndex == 7) {
                data.rx = newPt.x;
            }

            this._regenMBR();
        },

	    moveControlPointByOffset: function(/* int */ partIndex, /* int */ controlPointIndex, /* number */ deltaX, /* number */ deltaY) {
	        var data = this._data;
	        var cpx, cpy;
	        if (controlPointIndex == 0) {
	            data.rx -= deltaX;
	            data.ry += deltaY;
	        } else if (controlPointIndex == 1) {
	            data.ry += deltaY;
	        } else if (controlPointIndex == 2) {
	            data.rx += deltaX;
	            data.ry += deltaY;
	        } else if (controlPointIndex == 3) {
	            data.rx += deltaX;
	        } else if (controlPointIndex == 4) {
	            data.rx += deltaX;
	            data.ry -= deltaY;
	        } else if (controlPointIndex == 5) {
	            data.ry -= deltaY;
	        } else if (controlPointIndex == 6) {
	            data.rx -= deltaX;
	            data.ry -= deltaY;
	        } else if (controlPointIndex == 7) {
	            data.rx -= deltaX;
	        }

	        this._regenMBR();
	    },

	    /* PointD */ removeVertex: function (/* int */ partIndex, /* int */ controlPointIndex) { },
	    insertVertex: function (/* int */ partIndex, /* int */ controlPointIndex, /* PointD */ vtx) { },
	    insertPart: function (/* int */ partIndex, /* Array of PointD */ pointList) { },
	    /* Array of PointD */ removePart: function (/* int */ partIndex) { },

        /* PointD */ vertexSnap: function (/* PointD */ mapPt, /* number */ tol) {
            var data = this._data;
            var minX = data.cx - data.rx;
            var minY = data.cy - data.ry;
            var maxX = data.cx + data.rx;
            var maxY = data.cy + data.ry;

            pt = new Xr.PointD((minX + maxX) / 2, maxY);
            if (Xr.GeometryHelper.pointIn(pt.x, pt.y, tol, mapPt)) {
                return pt;
            }

            pt = new Xr.PointD(maxX, (minY + maxY) / 2);
            if (Xr.GeometryHelper.pointIn(pt.x, pt.y, tol, mapPt)) {
                return pt;
            }

            pt = new Xr.PointD((minX + maxX) / 2, minY);
            if (Xr.GeometryHelper.pointIn(pt.x, pt.y, tol, mapPt)) {
                return pt;
            }

            pt = new Xr.PointD(minX, (minY + maxY) / 2);
            if (Xr.GeometryHelper.pointIn(pt.x, pt.y, tol, mapPt)) {
                return pt;
            }

            return undefined;
        },

        /* PointD */ edgeSnap: function (/* PointD */ mapPt, /* number */ tol) {
            var data = this._data;
            var cp = new Xr.PointD(data.cx, data.cy);
            var angle = Xr.GeometryHelper.angle(cp, mapPt) * (Math.PI / 180.0);
            var ip = new Xr.PointD(
                data.cx + data.rx * Math.cos(angle),
                data.cy + data.ry * Math.sin(angle)
            );

            if (ip.distanceFrom(mapPt) < tol) {
                return ip;
            } else {
                return undefined;
            }
        },

        /* string */ toWKT: function (/* boolean */ bMulti) {
            return undefined;
        },

        /* boolean */ fromWKT: function (/* String */ wkt) {
            return false;
        }
	}
});