Xr.data = Xr.data || {};

Xr.data.PolygonShapeData = Xr.Class({
	name: "PolygonShapeData",
	requires: [Xr.data.IShapeData, Xr.edit.ISnap],

	construct: function (/* MBR or 'Array of Array' */ arg) {
	    if (arg instanceof Xr.MBR) {
	        this._polygons = new Array();
	        this._mbr = arg;
	    } else if (arg instanceof Array) {
	        this._polygons = arg;
	        this._regenMBR();
	    }
	},

	methods: {
	    /* boolean */ hitTest: function (/* number */ x, /* number */ y, /* CoordMapper */ cm) {
	        var coord = cm.V2W(x, y);
	        var polygons = this.data();
	        var ringCount = polygons.length;
	        var cntInside = 0;

	        for (var iRing = 0; iRing < ringCount; ++iRing) {
	            var polygon = polygons[iRing];
	            if (Xr.GeometryHelper.pointInPolygon(polygon, coord)) cntInside++;
	        }

	        if (cntInside % 2 == 1) return true;

	        return false;
	    },

	    /* ShapeData */ clone: function () {
	        var newParts = new Array();
	        var cntParts = this._polygons.length;

	        for (var iPart = 0; iPart < cntParts; iPart++) {
	            var part = this._polygons[iPart];
	            var newPart = new Array();
	            var cntPts = part.length;
	            for (var iPt = 0; iPt < part.length; iPt++) {
	                var pt = part[iPt];
	                var newPt = new Xr.PointD(pt.x, pt.y);
	                newPart[iPt] = newPt;
	            }
	            newParts[iPart] = newPart;
	        }

	        var newThing = new Xr.data.PolygonShapeData(newParts);
	        return newThing;
	    },

	    data: function() { 
	        return this._polygons;
	    },
		
	    MBR: function () {
	        return this._mbr;
	    },

	    _regenMBR: function () {
	        if (this._mbr == undefined) this._mbr = new Xr.MBR();

	        var newMBR = this._mbr;
	        newMBR.reset();

	        var polygons = this._polygons;
	        var ringCount = polygons.length;

	        for (var iRing = 0; iRing < ringCount; ++iRing) {
	            var polygon = polygons[iRing];
	            var vertexCount = polygon.length;
	            for (var iVtx = 0; iVtx < vertexCount; ++iVtx) {
	                var wp = polygon[iVtx];
	                newMBR.append(wp);
	            }
	        }
	    },

	    representativePoint: function () {
	        return Xr.GeometryHelper.centroidOfPolygon(this._polygons[0]);
	    },

	    /* String */ type: function () {
	        return "POLYGON";
	    },

	    /* ISkecth */ toSketch: function (/* EditManager */ editManager, /* int */ id) {
	        var sketch = new Xr.edit.PolygonSketch(editManager, this, id, false);
	        return sketch;
	    },

	    moveByOffset: function (/* number */ deltaX, /* number */ deltaY) {
	        var polygons = this._polygons;
	        var ringCount = polygons.length;

	        for (var iRing = 0; iRing < ringCount; ++iRing) {
	            var polygon = polygons[iRing];
	            var vertexCount = polygon.length;
	            for (var iVtx = 0; iVtx < vertexCount; ++iVtx) {
	                polygon[iVtx].add(deltaX, deltaY);
	            }
	        }

	        this._mbr.moveByOffset(deltaX, deltaY);
	    },

	    updateControlPoint: function (/* int */ partIndex, /* int */ controlPointIndex, /* PointD */ newPt, /* ouput PointD */ oldPt) {
	        var polygons = this._polygons;
	        var polygon = polygons[partIndex];

	        if (oldPt) oldPt.set(polygon[controlPointIndex].x, polygon[controlPointIndex].y);
	        polygon[controlPointIndex].set(newPt.x, newPt.y);

	        this._regenMBR();
	    },

	    moveControlPointByOffset: function (/* int */ partIndex, /* int */ controlPointIndex, /* number */ deltaX, /* number */ deltaY) {
	        var polygons = this._polygons;
	        var polygon = polygons[partIndex];  
	        polygon[controlPointIndex].add(deltaX, deltaY);
	            
	        this._regenMBR();
	    },

	    /* PointD */ removeVertex: function (/* int */ partIndex, /* int */ controlPointIndex) {
	        var polygons = this._polygons;
	        var polygon = polygons[partIndex];

	        var vtx = polygon[controlPointIndex];
	        polygon.splice(controlPointIndex, 1);

	        return vtx;
	    },


	    insertVertex: function (/* int */ partIndex, /* int */ controlPointIndex, /* PointD */ vtx) {
	        var polygons = this._polygons;
	        if (polygons == undefined) return false;

	        var polygon = polygons[partIndex];
	        if (polygon == undefined) return false;

	        polygon.splice(controlPointIndex, 0, vtx);

	        return true;
	    },

	    insertPart: function (/* int */ partIndex, /* Array of PointD */ pointList) {
	        var polygons = this._polygons;
	        if (polygons == undefined) return false;

	        var idxPartInserted = (partIndex == -1) ? polygons.length : partIndex;

	        polygons.splice(idxPartInserted, 0, pointList);

	        return true;
	    },

	    /* Array of PointD */ removePart: function (/* int */ partIndex) {
	        var polygons = this._polygons;
	        var idxPartRemoved = (partIndex == -1) ? (polygons.length - 1) : partIndex;
	        var polygon = polygons[idxPartRemoved];

	        polygons.splice(idxPartRemoved, 1);

	        return polygon;
	    },

	    /* PointD */ vertexSnap: function (/* PointD */ mapPt, /* number */ tol) {
	        if (this.MBR().contain(mapPt, tol)) {
	            var polygons = this._polygons;
	            var ringCount = polygons.length;

	            for (var iRing = 0; iRing < ringCount; ++iRing) {
	                var polygon = polygons[iRing];
	                var vertexCount = polygon.length;
	                for (var iVtx = 0; iVtx < vertexCount; ++iVtx) {
	                    var wp = polygon[iVtx];
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
	            var polygons = this._polygons;
	            var cntPolygons = polygons.length;

	            for (var iPart = 0; iPart < cntPolygons; iPart++) {
	                polygon = polygons[iPart];
	                var cntVtx = polygon.length - 1;
	                for (var iVtx = 0; iVtx < cntVtx; iVtx++) {
	                    var p1 = polygon[iVtx];
	                    var p2 = polygon[iVtx + 1];
	                    var intPt = Xr.GeometryHelper.intersectPointFromLine(p1, p2, mapPt, tol);
	                    if (intPt) {
	                        return intPt;
	                    }
	                }

	                intPt = Xr.GeometryHelper.intersectPointFromLine(polygon[0], polygon[cntVtx], mapPt, tol);
	                if (intPt) {
	                    return intPt;
	                }
	            }
	        }

	        return undefined
	    },

	    /* string */ toWKT: function (/* boolean */ bMulti) {
	        var cntPolygons = this._polygons.length;
	        var result = "";//"(";
			
	        for (var iPolygon = 0; iPolygon < cntPolygons; ++iPolygon) {
	            var polygon = this._polygons[iPolygon];
	            var cntVertex = polygon.length;
	            var partPolygon = "((";
	            var bClosed = (polygon[0].x == polygon[cntVertex - 1].x) && (polygon[0].y == polygon[cntVertex - 1].y);

	            for (var iVtx = 0; iVtx < cntVertex; ++iVtx) {
	                var vertex = polygon[iVtx];
	                if (iVtx != (cntVertex - 1)) {
	                    partPolygon += vertex.x + " " + vertex.y + ",";
	                }
	                else {
	                    if (bClosed) {
	                        partPolygon += vertex.x + " " + vertex.y + "))";
	                    }
	                    else {
	                        partPolygon += vertex.x + " " + vertex.y + "," + polygon[0].x + " " + polygon[0].y + "))";
	                    }

	                }
	            }

	            if (iPolygon != (cntPolygons - 1)) {
	                result += partPolygon + ",";
	            }
	            else {
	                result += partPolygon;// + ")";
	            }
	        }

	        if (bMulti) {
	            result = "MULTIPOLYGON(" + result + ")";
	        } else {
	            result = "POLYGON" + result;
	        }

	        return result;
	    },

	    /* boolean */ fromWKT: function (/* String */ wkt) {
	        wkt = wkt.toLowerCase();
	        wkt = wkt.replace("multipolygon", "");
	        wkt = wkt.replace("polygon", "");
	        wkt = wkt.replace(/ +/g, " "); // 2개 이상 반복되는 공백을 1개로 변환 
	        wkt = wkt.replace(/\) {0,}, {0,}\(/g, "|"); // "),("을 "|"로 변환
	        wkt = wkt.replace(/\(|\)/g, ""); // "(" 또는 ")"를 제거
	        //wkt = wkt.trim();

	        var parts = wkt.split("|");
	        var cntParts = parts.length;
	        var polygons = new Array();
	        for (var iPart = 0; iPart < cntParts; iPart++) {
	            var part = parts[iPart].trim().split(",");
	            var cntVtx = part.length;
	            var polygon = new Array();
	            for (var iVtx = 0; iVtx < cntVtx; iVtx++) {
	                var vtx = part[iVtx].trim().split(" ");
	                polygon.push(new Xr.PointD(parseFloat(vtx[0]), parseFloat(vtx[1])));
	            }

	            polygons.push(polygon);
	        }

	        this._polygons = polygons;

	        return true;
	    }
	}
});