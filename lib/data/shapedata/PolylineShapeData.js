Xr.data = Xr.data || {};

/**  
 * @classdesc 폴리라인 그래픽 Row에 대한 도형 정보 값을 담고 있는 클래스입니다. 
 * @class
 * @param {Xr.MBR} arg - 폴리라인에 대한 MBR 객체(Selective-Paramter)
 * @param {Array} arg - 배열에 대한 배열로써 자식 배열의 요소는 폴리라인을 구성하는 좌표이며 타입은 [Xr.PointD]{@link Xr.PointD}임(Selective-Paramter)
 * @copyright [(주)지오서비스]{@link http://www.geoservice.co.kr}
 * @license LGPL
 */
Xr.data.PolylineShapeData = Xr.Class({
	name: "PolylineShapeData",
	requires: [Xr.data.IShapeData, Xr.edit.ISnap],

	construct: function (/* MBR or Array of Array */ arg) {
	    if (arg instanceof Xr.MBR) {
	        this._polylines = new Array();	
	        this._mbr = arg;
	    } else if (arg instanceof Array) {
	        this._polylines = arg;
	        this._regenMBR();
	    }
	},

	methods: {
	    /* boolean */ hitTest: function (/* number */ x, /* number */ y, /* CoordMapper */ cm, /* optional Xr.symbol.IMarkerSymbol*/ markerSym) {
	        var coord = cm.V2W(x, y);
	        var polylines = this.data();
	        var ringCount = polylines.length;
	        var tol = cm.pickingTolerance();

	        for (var iRing = 0; iRing < ringCount; ++iRing) {
	            var polyline = polylines[iRing];
	            if (Xr.GeometryHelper.pointInPolyline(polyline, coord, tol)) return true;
	        }

	        return false;
	    },

	    /* ShapeData */ clone: function () {
	        var newParts = new Array();
	        var cntParts = this._polylines.length;

	        for (var iPart = 0; iPart < cntParts; iPart++) {
	            var part = this._polylines[iPart];
	            var newPart = new Array();
	            var cntPts = part.length;
	            for(var iPt=0; iPt < part.length; iPt++) {
	                var pt = part[iPt];
	                var newPt = new Xr.PointD(pt.x, pt.y);
	                newPart[iPt] = newPt;
	            }
	            newParts[iPart] = newPart;
	        }

	        var newThing = new Xr.data.PolylineShapeData(newParts);
	        return newThing;
	    },

		data: function() { 
			return this._polylines;
		},
		
		MBR: function () {
			return this._mbr;
		},

		_regenMBR: function() {
		    var newMBR = new Xr.MBR();
		    newMBR.reset();

		    var polylines = this._polylines;
		    var ringCount = polylines.length;

		    for (var iRing = 0; iRing < ringCount; ++iRing) {
		        var polyline = polylines[iRing];
		        var vertexCount = polyline.length;
		        for (var iVtx = 0; iVtx < vertexCount; ++iVtx) {
		            var wp = polyline[iVtx];
		            newMBR.append(wp);
		        }
		    }

		    this._mbr = newMBR; // Memory Leak ?
		    //this._mbr = new Xr.MBR(newMBR.minX, newMBR.minY, newMBR.maxX, newMBR.maxY);
		},

		representativePoint: function () {
		    return Xr.GeometryHelper.centroidOfPolyline(this._polylines[0]);
		},

	    /* Object {pt:PointD, angle:float}  */ representativePointWithAngle: function () {
	        return Xr.GeometryHelper.centroidOfPolylineWithAngle(this._polylines[0]);
        },

	    /* String */ type: function () {
	        return Xr.data.ShapeType.POLYLINE;
	    },

	    /* ISkecth */ toSketch: function (/* EditManager */ editManager, /* int */ id, /* boolean */ bMeasured) {
	        var sketch = new Xr.edit.PolylineSketch(editManager, this, id, false, bMeasured);
	        return sketch;
	    },

	    moveByOffset: function (/* number */ deltaX, /* number */ deltaY) {
	        var polylines = this._polylines;
	        var ringCount = polylines.length;

	        for (var iRing = 0; iRing < ringCount; ++iRing) {
	            var polyline = polylines[iRing];
	            var vertexCount = polyline.length;
	            for (var iVtx = 0; iVtx < vertexCount; ++iVtx) {
	                polyline[iVtx].add(deltaX, deltaY);
	            }
	        }

	        this._mbr.moveByOffset(deltaX, deltaY);
	    },

	    updateControlPoint: function (/* int */ partIndex, /* int */ controlPointIndex, /* PointD */ newPt, /* ouput PointD */ oldPt) {
	        var polylines = this._polylines;
	        var polyline = polylines[partIndex];

	        if (oldPt) oldPt.set(polyline[controlPointIndex].x, polyline[controlPointIndex].y);

	        polyline[controlPointIndex].set(newPt.x, newPt.y);

	        this._regenMBR();
	    },

	    moveControlPointByOffset: function (/* int */ partIndex, /* int */ controlPointIndex, /* number */ deltaX, /* number */ deltaY) {
	        var polylines = this._polylines;
	        var polyline = polylines[partIndex];
	        polyline[controlPointIndex].add(deltaX, deltaY);

	        this._regenMBR();
	    },

	    /* PointD */ removeVertex: function (/* int */ partIndex, /* int */ controlPointIndex) {
	        var polylines = this._polylines;
	        var polyline = polylines[partIndex];

	        var vtx = polyline[controlPointIndex];
	        polyline.splice(controlPointIndex, 1);

	        return vtx;
	    },

	    insertVertex: function (/* int */ partIndex, /* int */ controlPointIndex, /* PointD */ vtx) {
	        var polylines = this._polylines;
	        if (polylines == undefined) return false;

	        var polyline = polylines[partIndex];
	        if (polyline == undefined) return false;

	        polyline.splice(controlPointIndex, 0, vtx);

	        return true;
	    },

	    insertPart: function (/* int */ partIndex, /* Array of PointD */ pointList) {
	        var polylines = this._polylines;
	        if (polylines == undefined) return false;

	        var idxPartInserted = (partIndex == -1) ? polylines.length : partIndex;

	        polylines.splice(idxPartInserted, 0, pointList);
	    },

	    /* Array of PointD */ removePart: function (/* int */ partIndex) {
	        var polylines = this._polylines;
	        var idxPartRemoved = (partIndex == -1) ? (polylines.length - 1) : partIndex;
	        var polyline = polylines[idxPartRemoved];

	        polylines.splice(idxPartRemoved, 1);

	        return polyline;
	    },

	    /* PointD */ vertexSnap: function (/* PointD */ mapPt, /* number */ tol) {
	        if (this.MBR().contain(mapPt, tol)) {
	            var polylines = this._polylines;
	            var ringCount = polylines.length;

	            for (var iRing = 0; iRing < ringCount; ++iRing) {
	                var polyline = polylines[iRing];
	                var vertexCount = polyline.length;
	                for (var iVtx = 0; iVtx < vertexCount; ++iVtx) {
	                    var wp = polyline[iVtx];
	                    if (Xr.GeometryHelper.pointIn(wp.x, wp.y, tol, mapPt)) {
	                        return wp;
	                    }
	                }
	            }
	        }

	        return undefined;
	    },

	    /* PointD */ edgeSnap: function (/* PointD */ mapPt, /* number */ tol) {
	        if (this.MBR().contain(mapPt, tol)) {
	            var polylines = this._polylines;
	            var cntPolylines = polylines.length;

	            for (var iPart = 0; iPart < cntPolylines; iPart++) {
	                polyline = polylines[iPart];
	                var cntVtx = polyline.length - 1;
	                for (var iVtx = 0; iVtx < cntVtx; iVtx++) {
	                    var p1 = polyline[iVtx];
	                    var p2 = polyline[iVtx + 1];
	                    var intPt = Xr.GeometryHelper.intersectPointFromLine(p1, p2, mapPt, tol);
	                    if (intPt) {
	                        return intPt;
	                    }
	                }
	            }
	        }

	        return undefined
	    },

	    /* string */ toWKT: function (/* boolean */ bMulti) {
	        var cntPolylines = this._polylines.length;
	        var result = ""; 

	        for(var iPolyline=0; iPolyline<cntPolylines; ++iPolyline)
	        {
	            var polyline = this._polylines[iPolyline];
	            var cntVertex = polyline.length;
	            var partPolyline = "(";
				
	            for(var iVtx=0; iVtx<cntVertex; ++iVtx)
	            {
	                var vertex = polyline[iVtx];
	                if(iVtx != (cntVertex-1))
	                {
	                    partPolyline += vertex.x + " " + vertex.y + ",";
	                }
	                else
	                {
	                    partPolyline += vertex.x + " " + vertex.y + ")";
	                }
	            }
				
	            if(iPolyline != (cntPolylines-1))
	            {
	                result += partPolyline + ",";
	            }
	            else
	            {
	                result += partPolyline;
	            }
	        }
			
	        if (bMulti) {
	            result = "MULTILINESTRING(" + result + ")";
	        } else {
	            result = "LINESTRING" + result;
	        }

	        return result;
	    },

	    /* boolean */ fromWKT: function (/* String */ wkt) {
	        wkt = wkt.toLowerCase();

	        wkt = wkt.replace("multilinestring", "");
	        wkt = wkt.replace("linestring", "");

	        wkt = wkt.replace(/ +/g, " "); // 2개 이상 반복되는 공백을 1개로 변환 
	        wkt = wkt.replace(/\) {0,}, {0,}\(/g, "|"); // "),("을 "|"로 변환
	        wkt = wkt.replace(/\(|\)/g, ""); // "(" 또는 ")"를 제거
	        //wkt = wkt.trim();

	        var parts = wkt.split("|");
	        var cntParts = parts.length;
	        var polylines = new Array();
	        for (var iPart = 0; iPart < cntParts; iPart++) {
	            var part = parts[iPart].trim().split(",");
	            var cntVtx = part.length;
	            var polyline = new Array();
	            for (var iVtx = 0; iVtx < cntVtx; iVtx++) {
	                var vtx = part[iVtx].trim().split(" ");
	                polyline.push(new Xr.PointD(parseFloat(vtx[0]), parseFloat(vtx[1])));
	            }

	            polylines.push(polyline);
	        }

	        this._polylines = polylines;

            this._regenMBR();

	        return true;
	    }
	}
});